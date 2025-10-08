import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommonService } from './common.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('common')
@ApiBearerAuth()
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @InjectQueue('thumbnail-generation')
    private readonly thumbnailQueue: Queue,
  ) {}

  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter(req, file, cllback) {
        if (file.mimetype !== 'video/mp4') {
          return cllback(
            new BadRequestException('mp4타입만 업로드 가능합니다.'),
            false,
          );
        }
        return cllback(null, true);
      },
    }),
  )
  async createVideo(
    @UploadedFile()
    media: Express.Multer.File,
  ) {
    await this.thumbnailQueue.add(
      'thumbnail',
      {
        videoId: media.filename,
        videoPath: media.path,
      },
      {
        priority: 2,
        delay: 100,
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    return {
      fileName: media.filename,
    };
  }

  @Post('presigned-url')
  async createPresignedURL() {
    return {
      url: await this.commonService.createPresignedURL(),
    };
  }
}
