import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './media/media.module';

import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { DirectorModule } from './director/director.module';

import { GenreModule } from './genre/genre.module';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { RBACGuard } from './auth/guard/rbac.guard';
import { CommonModule } from './common/common.module';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { QueryExeptionFilter } from './common/filter/query-faild.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CacheModule } from '@nestjs/cache-manager';
import { ThrottleInterceptor } from './common/interceptor/throttle.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkerModul } from './worker/worker.module';

@Module({
  imports: [
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_URL: Joi.string().valid().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public/',
    }),
    CacheModule.register({ ttl: 3000, isGlobal: true }),
    DirectorModule,
    GenreModule,
    AuthModule,
    UserModule,
    JwtModule,
    CommonModule,
    ScheduleModule.forRoot(),
    WorkerModul,
    ConditionalModule.registerWhen(
      WorkerModul,
      (env: NodeJS.ProcessEnv) => env['TYPE'] === 'worker',
    ),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: ForbiddenExceptionFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: QueryExeptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ThrottleInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
