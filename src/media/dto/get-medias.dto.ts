import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';

export class GetMediasDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
