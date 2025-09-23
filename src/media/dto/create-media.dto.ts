import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class createMediaDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '미디어 제목',
    example: '미디어 1',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화 설명',
    example: '설명',
  })
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '감독 객체 ID',
    example: '1',
  })
  directorId: number;

  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @ApiProperty({
    description: '장르 객체 ID',
    example: '1',
  })
  genreIds: number[];

  @IsString()
  @ApiProperty({
    description: '미디어 파일 이름름 ',
    example: 'aaa-bbb-ccc.mp4',
  })
  mediaFileName: string;
}
