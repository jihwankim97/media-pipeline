import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { TasksService } from './tasks.service';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from './prisma.service';
import { PrismaErrorHandlerService } from './prisma-error-handler.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, callback) => {
          const split = file.originalname.split('.');

          let extension = 'mp4';

          if (split.length > 1) {
            extension = split[split.length - 1];
          }
          callback(null, `${randomUUID()}_${Date.now()}.${extension}`);
        },
      }),
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'thumbnail-generation',
    }),
  ],
  controllers: [CommonController],
  providers: [
    CommonService,
    TasksService,
    PrismaService,
    PrismaErrorHandlerService,
  ],
  exports: [CommonService, PrismaService, PrismaErrorHandlerService],
})
export class CommonModule {}
