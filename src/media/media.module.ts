import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { DirectorModule } from 'src/director/director.module';
import { GenreModule } from 'src/genre/genre.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [DirectorModule, GenreModule, CommonModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
