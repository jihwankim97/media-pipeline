import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entity/media.entity';
import { MediaDetail } from './entity/media.detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, MediaDetail])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
