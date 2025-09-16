import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { updateMediaDto } from './dto/update-media.dto';
import { createMediaDto } from './dto/create-media.dto';
import { Media } from './entity/media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { MediaDetail } from './entity/media.detail.entity';
import { DirectorService } from 'src/director/director.service';
import { Genre } from 'src/genre/entities/genre.entity';
import { Director } from 'src/director/entity/director.entity';
import { GetMediasDto } from './dto/get-medias.dto';
import { CommonService } from '../common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entities/user.entity';
import { MediaUserLike } from './entity/media-user-like.entity';

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
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MediaUserLike)
    private readonly mediaUserLikeRepository: Repository<MediaUserLike>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async validateExists(id: number) {
    const isExists = await this.mediaRepository.exists({ where: { id } });

    if (!isExists) {
      throw new NotFoundException('존재하지 않는 ID의 media입니다.');
    }
  }

  async findAll(dto: GetMediasDto, userId?: number) {
    const { title } = dto;

    const qb = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.director', 'director')
      .leftJoinAndSelect('media.genres', 'genres');

    if (title) {
      qb.where('media.title LIKE :title', { title: `%${title}%` });
    }

    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    let [data, count] = await qb.getManyAndCount();

    if (userId) {
      const mediaIds = data.map((media) => media.id);
      const likedMedias =
        mediaIds.length < 1
          ? []
          : await this.mediaUserLikeRepository
              .createQueryBuilder('mul')
              .leftJoinAndSelect('mul.user', 'user')
              .leftJoinAndSelect('mul.media', 'media')
              .where('media.id In(:...mediaIds)', { mediaIds })
              .andWhere('user.id = :userId', { userId })
              .getMany();

      const likedMediaMap = likedMedias.reduce(
        (acc, next) => ({
          ...acc,
          [next.media.id]: next.isLike,
        }),
        {} as Record<number, boolean>,
      );

      data = data.map((x) => ({
        ...x,
        likeStatus: x.id in likedMediaMap ? likedMediaMap[x.id] : null,
      }));
    }

    return {
      data,
      nextCursor,
      count,
    };
  }

  async findOne(id: number) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres', 'creator'],
    });
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    return media;
  }

  async create(dto: createMediaDto, qr: QueryRunner, userId: number) {
    const isDirectorExists = await qr.manager.exists(Director, {
      where: { id: dto.directorId },
    });
    if (!isDirectorExists) {
      throw new NotFoundException('존재하지 않는 director ID입니다.');
    }

    const isTitleExists = await qr.manager.exists(Media, {
      where: { title: dto.title },
    });

    if (isTitleExists) {
      throw new NotFoundException('이미 존재하는 title입니다.');
    }

    const genres = await qr.manager.find(Genre, {
      where: { id: In(dto.genreIds) },
    });

    if (genres.length !== dto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않은 ID의 genre가 있습니다. -> ${genres.map((genre) => genre.id).join(',')}`,
      );
    }

    const mediaFolder = join('public', 'media');

    const tempFolder = join('public', 'temp');

    const media = await qr.manager.save(Media, {
      title: dto.title,
      genres: genres,
      detail: { detail: dto.detail },
      director: { id: dto.directorId },
      mediaFilePath: join(mediaFolder, dto.mediaFileName),
      creator: { id: userId },
    });

    await rename(
      join(process.cwd(), tempFolder, dto.mediaFileName),
      join(process.cwd(), mediaFolder, dto.mediaFileName),
    );
    return media;
  }

  async update(id: number, dto: updateMediaDto, qr: QueryRunner) {
    let media = await qr.manager.findOne(Media, {
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    const { detail, directorId, genreIds, ...mediaRest } = dto;

    if (detail) {
      media.detail.detail = detail;
    }

    if (directorId) {
      const isDirectorExists = await qr.manager.exists(Director, {
        where: { id: dto.directorId },
      });

      if (!isDirectorExists) {
        throw new NotFoundException('존재하지 않는 director ID입니다.');
      }
      media.director = { id: directorId } as Director;
    }

    if (genreIds && genreIds.length > 0) {
      const genres = await qr.manager.find(Genre, {
        where: { id: In(genreIds.map((id) => id)) },
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

    media = await qr.manager.save(Media, media);

    return media;
  }

  async remove(id: number) {
    const media = await this.findOne(id);

    await this.mediaRepository.delete(id);
    await this.mediadetailRepository.delete(media.detail.id);
    return id;
  }

  async toggleMediaLike(mediaId: number, userId: number, isLike: boolean) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });

    if (!media) {
      throw new BadRequestException('존재하지 않는 미디어입니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 유저입니다.');
    }

    const likeRecord = await this.mediaUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.media', 'media')
      .leftJoinAndSelect('mul.user', 'user')
      .where('media.id = :mediaId', { mediaId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.mediaUserLikeRepository.delete({ media, user });
      } else {
        await this.mediaUserLikeRepository.update({ media, user }, { isLike });
      }
    } else {
      await this.mediaUserLikeRepository.save({
        media,
        user,
        isLike,
      });
    }

    const result = await this.mediaUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.media', 'media')
      .leftJoinAndSelect('mul.user', 'user')
      .where('media.id = :mediaId', { mediaId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return {
      isLike: result && result.isLike,
    };
  }
}
