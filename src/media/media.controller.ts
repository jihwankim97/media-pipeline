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
import { Role } from 'src/user/entities/user.entity';
import { GetMediasDto } from './dto/get-medias.dto';
import { Query } from '@nestjs/common';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/drcorator/query-runner.decorator';

@Controller('medias')
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Public()
  async getMedias(@Query() dto: GetMediasDto) {
    return await this.mediaService.findAll(dto);
  }

  @Get('/:id')
  @Public()
  getMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMedia(
    @Body() dto: createMediaDto,
    @QueryRunner() qr,
    @UserId() userId: number,
  ) {
    return this.mediaService.create(dto, qr, userId);
  }

  @Patch('/:id')
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  patchMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateMediaDto,
    @QueryRunner() qr,
  ) {
    return this.mediaService.update(id, dto, qr);
  }

  @Delete('/:id')
  @RBAC(Role.admin)
  deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
