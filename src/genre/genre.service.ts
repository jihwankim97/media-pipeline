import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async validateExists(id: number) {
    const isExists = await this.genreRepository.exists({ where: { id } });

    if (!isExists) {
      throw new NotFoundException('존재하지 않는 ID의 genre입니다.');
    }
  }

  async create(createGenreDto: CreateGenreDto) {
    const isExists = await this.genreRepository.exists({
      where: { name: createGenreDto.name },
    });
    if (isExists) {
      throw new ConflictException('이미 존재하는 genre입니다.');
    }

    const newGenre = await this.genreRepository.save(createGenreDto);
    return newGenre;
  }

  async findAll() {
    return await this.genreRepository.find();
  }

  async findOne(id: number) {
    const genre = await this.genreRepository.findOne({ where: { id } });

    if (!genre) {
      throw new NotFoundException(`존재하지 않는 id의 genre입니다.`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      throw new NotFoundException('존재하지 않는 장르입니다.');
    }

    Object.assign(genre, updateGenreDto);
    return await this.genreRepository.save(genre);
  }

  async remove(id: number) {
    await this.validateExists(id);
    await this.genreRepository.delete(id);
    return id;
  }
}
