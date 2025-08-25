import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  detail?: string;
}
