import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/common/prisma.service';
import { PrismaErrorHandlerService } from 'src/common/prisma-error-handler.service';

@Injectable()
export class GenreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorHandler: PrismaErrorHandlerService,
  ) {}
  async create(createGenreDto: CreateGenreDto) {
    try {
      const newGenre = await this.prisma.genre.create({ data: createGenreDto });
      return newGenre;
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }

  async findAll() {
    return await this.prisma.genre.findMany();
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });

    if (!genre) {
      throw new NotFoundException(`존재하지 않는 id의 genre입니다.`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: updateGenreDto,
      });
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.genre.delete({ where: { id } });
      return id;
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }
}
