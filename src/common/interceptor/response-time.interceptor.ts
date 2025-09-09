import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithUser } from 'src/auth/types/request.types';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const reqTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const respTime = Date.now();

        console.log(`[${req.method} ${req.path}] ${respTime - reqTime}ms`);
      }),
    );
  }
}
