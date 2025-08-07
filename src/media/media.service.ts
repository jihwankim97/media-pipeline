import { Injectable, NotFoundException } from '@nestjs/common';
import { updateMediaDto } from './dto/update-media.dto';
import { createMediaDto } from './dto/create-media.dto';

export interface Media {
  id: number;
  title: string;
  genre: string;
}

@Injectable()
export class MediaService {
  private medias: Media[] = [
    {
      id: 12,
      title: 'media1',
      genre: 'factasy',
    },
    {
      id: 13,
      title: 'media2',
      genre: 'factasy',
    },
  ];
  private idCounter = 3;

  getAllMedias(title: string) {
    if (!title) return this.medias;

    return this.medias.filter((m) => m.title.startsWith(title));
  }

  getMediaById(id: number) {
    const media = this.medias.find((media) => media.id === id);
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    return media;
  }

  createMedia(dto: createMediaDto) {
    const media = { id: this.idCounter++, ...dto };
    this.medias.push(media);
    return media;
  }

  updateMedia(id: number, dto: updateMediaDto) {
    const media = this.medias.find((media) => media.id === id);
    if (!media) throw new NotFoundException('존재하지 않는 ID입니다.');

    Object.assign(media, dto);

    return media;
  }

  deleteMedia(id: number) {
    const mediaIndex = this.medias.findIndex((media) => media.id === id);
    if (mediaIndex === -1)
      throw new NotFoundException('존재하지 않는 ID입니다.');

    this.medias.splice(mediaIndex, 1);

    return id;
  }
}
