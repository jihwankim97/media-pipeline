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
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { createMediaDto } from './dto/create-media.dto';
import { updateMediaDto } from './dto/update-media.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { GetMediasDto } from './dto/get-medias.dto';
import { Query } from '@nestjs/common';
import { UserId } from 'src/user/decorator/user-id.decorator';

import {
  CacheKey,
  CacheTTL,
  CacheInterceptor as CI,
} from '@nestjs/cache-manager';
import { Throttle } from 'src/common/decorator/throttle.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@Controller('medias')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Public()
  @Throttle({
    count: 5,
    unit: 'minute',
  })
  @ApiOperation({
    description: '[Media]를 페이지네이션 하는 api',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 api를 실행 했을때',
  })
  @ApiResponse({
    status: 400,
    description: '잘못 api를 실행 했을때',
  })
  async getMedias(@Query() dto: GetMediasDto, @UserId() userId?: number) {
    return await this.mediaService.findAll(dto, userId);
  }

  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMediaRecent')
  @CacheTTL(0)
  getMediasRecent() {
    return this.mediaService.findRecent();
  }

  @Get('/:id')
  @Public()
  getMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  postMedia(@Body() dto: createMediaDto, @UserId() userId: number) {
    return this.mediaService.create(dto, userId);
  }

  @Patch('/:id')
  @RBAC(Role.admin)
  patchMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateMediaDto,
  ) {
    return this.mediaService.update(id, dto);
  }

  @Delete('/:id')
  @RBAC(Role.admin)
  deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }

  @Post('/:id/like')
  createMediaLike(
    @Param('id', ParseIntPipe) mediaId: number,
    @UserId() userId: number,
  ) {
    return this.mediaService.toggleMediaLike(mediaId, userId, true);
  }

  @Post('/:id/dislike')
  createMediaDisLike(
    @Param('id', ParseIntPipe) mediaId: number,
    @UserId() userId: number,
  ) {
    return this.mediaService.toggleMediaLike(mediaId, userId, false);
  }
}
