import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { createMediaDto } from './dto/create-media.dto';
import { updateMediaDto } from './dto/update-media.dto';
import { MediaTitleValidationPile } from './pipe/media-title-validation.pipe';

@Controller('medias')
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  getMedias(@Query('title', MediaTitleValidationPile) title: string) {
    return this.mediaService.findAll(title);
  }

  @Get('/:id')
  getMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Post()
  postMedia(@Body() dto: createMediaDto) {
    return this.mediaService.create(dto);
  }

  @Patch('/:id')
  patchMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateMediaDto,
  ) {
    return this.mediaService.update(id, dto);
  }

  @Delete('/:id')
  deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
