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
  title: string;

  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds: string[];

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  directorId: number;
}
