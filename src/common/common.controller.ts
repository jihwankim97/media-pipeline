import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
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
}
