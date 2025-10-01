import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async validateExists(id: number) {
    const isExists = await this.userRepository.exists({ where: { id } });

    if (!isExists) {
      throw new NotFoundException(`아이디가 ${id}인 유저가 없습니다.`);
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다.');
    }

    const hashRounds = this.configService.get<number>('HASH_ROUNDS');
    if (!hashRounds) {
      throw new Error('HASH_ROUNDS 환경 변수가 설정되지 않았습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, hashRounds);

    await this.userRepository.save({ email, password: hashedPassword });

    return this.userRepository.findOne({ where: { email } });
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
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`아이디가 ${id}인 유저가 없습니다.`);
    }

    await this.userRepository.delete(id);

    return id;
  }
}
