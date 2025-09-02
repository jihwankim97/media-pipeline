import { createMediaDto } from './create-media.dto';
import { PartialType } from '@nestjs/mapped-types';

export class updateMediaDto extends PartialType(createMediaDto) {}
