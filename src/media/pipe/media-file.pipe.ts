import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { rename } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MediaFilePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  constructor(
    private readonly options: {
      maxSize: number;
      mimetype: string;
    },
  ) {}
  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('media 필드는 필수입니다.');
    }

    const byteSize = this.options.maxSize * 1000000;

    if (value.size > byteSize) {
      throw new BadRequestException(
        `${this.options.maxSize}MB 이하의 사이즈만 업로드 가능합니다.`,
      );
    }

    if (value.mimetype !== this.options.mimetype) {
      throw new BadRequestException(
        `${this.options.mimetype}만 업로드 가능합니다.`,
      );
    }

    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }

    const filename = `${randomUUID()}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename);

    await rename(value.path, newPath);

    return {
      ...value,
      filename,
      path: newPath,
    };
  }
}
