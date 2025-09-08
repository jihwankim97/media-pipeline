import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateExists(id: number) {
    const isExists = await this.userRepository.exists({ where: { id } });

    if (!isExists) {
      throw new NotFoundException(`아이디가 ${id}인 유저가 없습니다.`);
    }
  }

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`아이디가 ${id}인 유저가 없습니다.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`아이디가 ${id}인 유저가 없습니다.`);
    }

    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);

    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    await this.validateExists(id);

    return await this.userRepository.delete(id);
  }
}
