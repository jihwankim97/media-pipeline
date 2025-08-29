import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class updateMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @IsNumber({}, { each: true })
  genreIds?: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  detail?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  directorId?: number;
}
