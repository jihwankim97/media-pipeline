import { Injectable, NotFoundException } from '@nestjs/common';
import { updateMediaDto } from './dto/update-media.dto';
import { createMediaDto } from './dto/create-media.dto';
import { Media } from './entity/media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MediaDetail } from './entity/media.detail.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(MediaDetail)
    private readonly mediadetailRepository: Repository<MediaDetail>,
  ) {}

  async getAllMedias(title: string) {
    if (!title)
      return [
        await this.mediaRepository.find(),
        await this.mediaRepository.count(),
      ];

    return this.mediaRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
    });
  }

  async getMediaById(id: number) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['detail'],
    });
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    return media;
  }

  async createMedia(dto: createMediaDto) {
    const mediaDetail = await this.mediadetailRepository.save({
      detail: dto.detail,
    });
    const media = await this.mediaRepository.save({
      title: dto.title,
      genre: dto.genre,
      detail: mediaDetail,
    });
    return media;
  }

  async updateMedia(id: number, dto: updateMediaDto) {
    const media = await this.getMediaById(id);

    const { detail, ...mediaRest } = dto;

    await this.mediaRepository.update({ id }, mediaRest);

    if (detail) {
      await this.mediadetailRepository.update(
        {
          id: media.detail.id,
        },
        { detail },
      );
    }

    const newMedia = await this.getMediaById(id);

    return newMedia;
  }

  async deleteMedia(id: number) {
    const media = await this.getMediaById(id);

    await this.mediaRepository.delete(id);
    await this.mediadetailRepository.delete(media.detail.id);
    return id;
  }
}
