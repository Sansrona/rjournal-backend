import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  create(dto: CreateUserDto) {
    return this.repository.save(dto);
  }

  findAll() {
    return this.repository.find();
  }

  findByCond(obj: LoginUserDto) {
    return this.repository.findOne(obj);
  }
  async search(dto: SearchUserDto) {
    const qb = this.repository.createQueryBuilder('u');

    qb.limit(dto.limit || 10);
    qb.take(dto.take || 10);

    if (dto.email) {
      qb.andWhere(`u.email LIKE :email`);
    }
    if (dto.fullName) {
      qb.andWhere(`u.fullName LIKE :fullName`);
    }

    qb.setParameters({
      email: `%${dto.email}%`,
      fullName: `%${dto.fullName}%`,
    });

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number) {
    const find = await this.repository.findOne(+id);
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    return find;
  }

  async update(id: number, dto: UpdateUserDto) {
    const find = await this.repository.update(id, dto);
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    const find = await this.repository.delete(id);
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    return this.repository.delete(id);
  }
}
