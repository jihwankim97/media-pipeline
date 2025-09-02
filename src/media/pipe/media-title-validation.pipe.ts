import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MediaTitleValidationPile implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    if (value.length <= 2) {
      throw new BadRequestException('title은 3자 이상이어야 합니다.');
    }

    return value;
  }
}
