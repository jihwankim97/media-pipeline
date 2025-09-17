import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { RequestWithUser } from 'src/auth/types/request.types';
import { Throttle } from '../decorator/throttle.decorator';

@Injectable()
export class ThrottleInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = req?.user?.sub;

    if (!userId) {
      return next.handle();
    }

    const throttleOptions = this.reflector.get<{
      count: number;
      unit: 'minute';
    }>(Throttle, context.getHandler());

    if (!throttleOptions) {
      return next.handle();
    }
    const date = new Date();
    const minute = date.getMinutes();

    const key = `${req.method}_${req.path}_${userId}_${minute}`;
    const count = await this.cacheManager.get<number>(key);

    console.log(key, count);

    if (count && count >= throttleOptions.count) {
      throw new ForbiddenException(
        '요청 가능 횟수를 초과했습니다. 잠시후 요청 해주세요',
      );
    }

    return next.handle().pipe(
      tap(() => {
        (async () => {
          const count = (await this.cacheManager.get<number>(key)) ?? 0;
          this.cacheManager.set(key, count + 1, 60000);
        })();
      }),
    );
  }
}
