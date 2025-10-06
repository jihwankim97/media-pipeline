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

@Controller('common')
@ApiBearerAuth()
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

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
  createVideo(
    @UploadedFile()
    media: Express.Multer.File,
  ) {
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
