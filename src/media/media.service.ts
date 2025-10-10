import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { updateMediaDto } from './dto/update-media.dto';
import { createMediaDto } from './dto/create-media.dto';
import { GetMediasDto } from './dto/get-medias.dto';
import { CommonService } from '../common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma.service';
import { PrismaErrorHandlerService } from 'src/common/prisma-error-handler.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly prismaErrorHandler: PrismaErrorHandlerService,
  ) {}

  async findRecent() {
    const cacheData = await this.cacheManager.get('MEDIA_RECENT');

    if (cacheData) {
      return cacheData;
    }

    const data = await this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    await this.cacheManager.set('MEDIA_RECENT', data);

    return data;
  }

  async findAll(dto: GetMediasDto, userId?: number) {
    const { title, cursor, take, order } = dto;

    const orderBy = order.map((field) => {
      const [column, direction] = field.split('_');

      return { [column]: direction.toLocaleLowerCase() };
    });

    const queryOptions: any = {
      where: title ? { title: { contains: title } } : {},
      take: take + 1,
      skip: cursor ? 1 : 0,
      orderBy: orderBy,
      include: { genres: true, director: true },
    };

    if (cursor) {
      const cursorId = parseInt(cursor);
      if (!isNaN(cursorId)) {
        queryOptions.cursor = { id: cursorId };
      }
    }

    const medias = await this.prisma.media.findMany(queryOptions);

    const hasNextPage = medias.length > take;
    if (hasNextPage) medias.pop();

    const nextCursor = hasNextPage
      ? medias[medias.length - 1].id.toString()
      : null;

    if (userId) {
      const mediaIds = medias.map((media) => media.id);
      const likedMedias =
        mediaIds.length < 1
          ? []
          : await this.prisma.mediaUserLike.findMany({
              where: {
                mediaId: { in: mediaIds },
                userId,
              },
              include: {
                media: true,
              },
            });

      const likedMediaMap = likedMedias.reduce(
        (acc, next) => ({
          ...acc,
          [next.media.id]: next.isLike,
        }),
        {} as Record<number, boolean>,
      );

      return {
        data: medias.map((media) => ({
          ...media,
          likeStatus:
            media.id in likedMediaMap ? likedMediaMap[media.id] : null,
        })),
        nextCursor,
        hasNextPage,
      };
    }

    return {
      data: medias,
      nextCursor,
      hasNextPage,
    };
  }

  async findOne(id: number) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        detail: true,
        director: true,
        genres: true,
        creator: true,
      },
    });
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    return media;
  }

  async renameMediaFile(
    tempFolder: string,
    mediaFolder: string,
    createMediaDto: createMediaDto,
  ) {
    if (this.configService.get('ENV') !== 'prod') {
      return await rename(
        join(process.cwd(), tempFolder, createMediaDto.mediaFileName),
        join(process.cwd(), mediaFolder, createMediaDto.mediaFileName),
      );
    } else {
      return await this.commonService.saveMediaToPermanentStorage(
        createMediaDto.mediaFileName,
      );
    }
  }

  async create(dto: createMediaDto, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const director = await prisma.director.findUnique({
        where: { id: dto.directorId },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 director ID입니다.');
      }

      const titleCount = await prisma.media.count({
        where: { title: dto.title },
      });

      if (titleCount > 0) {
        throw new ConflictException('이미 존재하는 title입니다.');
      }

      const genres = await prisma.genre.findMany({
        where: {
          id: {
            in: dto.genreIds,
          },
        },
      });

      if (genres.length !== dto.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않은 ID의 genre가 있습니다. -> ${genres.map((genre) => genre.id).join(',')}`,
        );
      }

      const mediaDetail = await prisma.mediaDetail.create({
        data: { detail: dto.detail },
      });

      const mediaFolder = join('public', 'media');

      const tempFolder = join('public', 'temp');

      const media = await prisma.media.create({
        data: {
          title: dto.title,
          mediaFilePath: join(mediaFolder, dto.mediaFileName),
          creator: { connect: { id: userId } },
          director: { connect: { id: director.id } },
          genres: { connect: genres.map((genre) => ({ id: genre.id })) },
          detail: { connect: { id: mediaDetail.id } },
        },
      });

      await this.renameMediaFile(tempFolder, mediaFolder, dto);

      return prisma.media.findUnique({
        where: { id: media.id },
        include: { detail: true, director: true, genres: true },
      });
    });
  }

  async update(id: number, dto: updateMediaDto) {
    return this.prisma.$transaction(async (prisma) => {
      const media = await prisma.media.findUnique({
        where: { id },
        include: { detail: true, director: true, genres: true },
      });

      if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

      const { detail, directorId, genreIds, ...mediaRest } = dto;

      const mediaUpdateParams: Prisma.MediaUpdateInput = { ...mediaRest };

      if (directorId) {
        const director = await prisma.director.findUnique({
          where: { id: directorId },
        });

        if (!director)
          throw new NotFoundException('존재하지 않는 director ID입니다.');

        mediaUpdateParams.director = { connect: { id: directorId } };
      }

      if (genreIds && genreIds.length > 0) {
        const genres = await prisma.genre.findMany({
          where: { id: { in: genreIds } },
        });

        if (genres.length !== genreIds.length) {
          throw new NotFoundException(
            '존재하지 않는 genre ID가 포함되어 있습니다.',
          );
        }

        mediaUpdateParams.genres = {
          set: genres.map((genre) => ({ id: genre.id })),
        };
      }

      await prisma.media.update({
        where: { id },
        data: mediaUpdateParams,
      });

      if (detail) {
        await prisma.mediaDetail.update({
          where: { id: media.detail.id },
          data: { detail },
        });
      }

      return prisma.media.findUnique({
        where: { id },
        include: { detail: true, director: true, genres: true },
      });
    });
  }

  async remove(id: number) {
    try {
      const media = await this.prisma.media.findUnique({
        where: { id },
        include: { detail: true },
      });
      await this.prisma.media.delete({ where: { id } });
      await this.prisma.mediaDetail.delete({
        where: { id: media?.detail.id },
      });
      return id;
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }

  async toggleMediaLike(mediaId: number, userId: number, isLike: boolean) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new BadRequestException('존재하지 않는 미디어입니다.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 유저입니다.');
    }

    const likeRecord = await this.prisma.mediaUserLike.findUnique({
      where: { mediaId_userId: { mediaId, userId } },
    });

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.prisma.mediaUserLike.delete({
          where: { mediaId_userId: { mediaId, userId } },
        });
      } else {
        await this.prisma.mediaUserLike.update({
          where: { mediaId_userId: { mediaId, userId } },
          data: { isLike },
        });
      }
    } else {
      await this.prisma.mediaUserLike.create({
        data: {
          media: { connect: { id: mediaId } },
          user: { connect: { id: userId } },
          isLike,
        },
      });
    }

    const result = await this.prisma.mediaUserLike.findUnique({
      where: { mediaId_userId: { mediaId, userId } },
    });

    return {
      isLike: result && result.isLike,
    };
  }
}
