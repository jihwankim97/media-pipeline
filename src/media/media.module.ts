import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entity/media.entity';
import { MediaDetail } from './entity/media.detail.entity';
import { DirectorModule } from 'src/director/director.module';
import { GenreModule } from 'src/genre/genre.module';
import { Genre } from 'src/genre/entities/genre.entity';
import { CommonModule } from 'src/common/common.module';
import { Director } from 'src/director/entity/director.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, MediaDetail, Genre, Director]),
    DirectorModule,
    GenreModule,
    CommonModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
