import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { RequestWithUser } from 'src/auth/types/request.types';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    req.queryRunner = qr;

    return next.handle().pipe(
      catchError((e) => {
        qr.rollbackTransaction()
          .then(() => qr.release())
          .catch(() => {});
        throw e;
      }),
      tap(() => {
        qr.commitTransaction()
          .then(() => qr.release())
          .catch(() => {});
      }),
    );
  }
}
