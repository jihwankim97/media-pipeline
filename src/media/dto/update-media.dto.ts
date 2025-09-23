import { createMediaDto } from './create-media.dto';
import { PartialType } from '@nestjs/swagger';

export class updateMediaDto extends PartialType(createMediaDto) {}
