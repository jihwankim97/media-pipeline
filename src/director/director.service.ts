import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { PrismaService } from 'src/common/prisma.service';
import { PrismaErrorHandlerService } from 'src/common/prisma-error-handler.service';

@Injectable()
export class DirectorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorHandler: PrismaErrorHandlerService,
  ) {}

  async create(createDirectorDto: CreateDirectorDto) {
    try {
      return await this.prisma.director.create({ data: createDirectorDto });
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }

  async findAll() {
    return await this.prisma.director.findMany();
  }

  async findOne(id: number) {
    const director = await this.prisma.director.findUnique({
      where: { id },
    });

    if (!director) {
      throw new NotFoundException(`존재하지 않는 ID의 director입니다.`);
    }

    return director;
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    try {
      return await this.prisma.director.update({
        where: { id },
        data: updateDirectorDto,
      });
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.director.delete({ where: { id } });
      return id;
    } catch (error) {
      this.prismaErrorHandler.handle(error);
    }
  }
}
