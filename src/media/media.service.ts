import { Injectable, NotFoundException } from '@nestjs/common';
import { updateMediaDto } from './dto/update-media.dto';
import { createMediaDto } from './dto/create-media.dto';
import { Media } from './entity/media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async getAllMedias(title: string) {
    if (!title) return await this.mediaRepository.find();

    return await this.mediaRepository.find({
      where: { title: Like(`%${title}%`) },
    });
  }

  async getMediaById(id: number) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    return media;
  }

  async createMedia(dto: createMediaDto) {
    const media = await this.mediaRepository.save(dto);
    return media;
  }

  async updateMedia(id: number, dto: updateMediaDto) {
    await this.getMediaById(id);

    await this.mediaRepository.update(id, { ...dto });

    const media = await this.getMediaById(id);

    return media;
  }

  async deleteMedia(id: number) {
    await this.getMediaById(id);

    await this.mediaRepository.delete(id);

    return id;
  }
}
