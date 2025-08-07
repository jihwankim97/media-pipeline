import { IsNotEmpty, IsString } from 'class-validator';

export class createMediaDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  genre: string;
}
