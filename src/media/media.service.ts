import { Injectable, NotFoundException } from '@nestjs/common';
import { updateMediaDto } from './dto/update-media.dto';
import { createMediaDto } from './dto/create-media.dto';
import { Media } from './entity/media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { MediaDetail } from './entity/media.detail.entity';
import { DirectorService } from 'src/director/director.service';
import { Genre } from 'src/genre/entities/genre.entity';
import { Director } from 'src/director/entity/director.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(MediaDetail)
    private readonly mediadetailRepository: Repository<MediaDetail>,
    private readonly directorService: DirectorService,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async validateExists(id: number) {
    const isExists = await this.mediaRepository.exists({ where: { id } });

    if (!isExists) {
      throw new NotFoundException('존재하지 않는 ID의 media입니다.');
    }
  }

  async findAll(title: string) {
    if (!title) {
      return this.mediaRepository.findAndCount({
        relations: ['detail', 'director', 'genres'],
      });
    }

    return this.mediaRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['detail', 'director', 'genres'],
    });
  }

  async findOne(id: number) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    return media;
  }

  async create(dto: createMediaDto) {
    await this.directorService.validateExists(dto.directorId);

    const genres = await this.genreRepository.find({
      where: { id: In(dto.genreIds) },
    });

    if (genres.length !== dto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않은 ID의 genre가 있습니다. -> ${genres.map((genre) => genre.id).join(',')}`,
      );
    }

    const media = await this.mediaRepository.save({
      title: dto.title,
      genres: genres,
      detail: { detail: dto.detail },
      director: { id: dto.directorId },
    });
    return media;
  }

  async update(id: number, dto: updateMediaDto) {
    const media = await this.findOne(id);

    const { detail, directorId, genreIds, ...mediaRest } = dto;

    if (detail) {
      media.detail.detail = detail;
    }

    if (directorId) {
      await this.directorService.validateExists(directorId);
      media.director = { id: directorId } as Director;
    }

    if (genreIds && genreIds.length > 0) {
      const genres = await this.genreRepository.find({
        where: { id: In(genreIds.map((id) => parseInt(id))) },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(
          '존재하지 않는 genre ID가 포함되어 있습니다.',
        );
      }

      media.genres = genres;
    }

    if (Object.keys(mediaRest).length > 0) {
      Object.assign(media, mediaRest);
    }
    return await this.mediaRepository.save(media);
  }

  async remove(id: number) {
    const media = await this.findOne(id);

    await this.mediaRepository.delete(id);
    await this.mediadetailRepository.delete(media.detail.id);
    return id;
  }
}
