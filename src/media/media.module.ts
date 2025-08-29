import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entity/media.entity';
import { MediaDetail } from './entity/media.detail.entity';
import { DirectorModule } from 'src/director/director.module';
import { GenreModule } from 'src/genre/genre.module';
import { Genre } from 'src/genre/entities/genre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, MediaDetail, Genre]),
    DirectorModule,
    GenreModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
