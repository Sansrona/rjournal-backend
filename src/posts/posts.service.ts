import { SearchPostDto } from './dto/search-post.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private repository: Repository<PostEntity>,
  ) {}

  create(dto: CreatePostDto, userId: number) {
    return this.repository.save({
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      user: { id: userId },
    });
  }

  findAll() {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async search(dto: SearchPostDto) {
    const qb = this.repository.createQueryBuilder('p');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 10);

    if (dto.views) {
      qb.orderBy('views', dto.views);
    }

    if (dto.body) {
      qb.andWhere(`p.body LIKE :body`);
    }
    if (dto.title) {
      qb.andWhere(`p.title LIKE :title`);
    }
    if (dto.tag) {
      qb.andWhere(`p.tags LIKE :tag`);
    }

    qb.setParameters({
      body: `%${dto.body}%`,
      title: `%${dto.title}%`,
      tag: `%${dto.tag}%`,
      views: dto.views || '',
    });

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async popular() {
    const qb = this.repository.createQueryBuilder();
    qb.orderBy('views', 'DESC');
    qb.limit(10);
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: number) {
    await this.repository
      .createQueryBuilder('posts')
      .whereInIds(id)
      .update()
      .set({
        views: () => `views + 1`,
      })
      .execute();
    const find = await this.repository.findOne(+id);
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    return find;
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    const find = await this.repository.update(id, dto);
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }

    return this.repository.update(id, {
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      user: { id: userId },
    });
  }

  async remove(id: number, userId: number) {
    const find = await this.repository.findOne(id);
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    if (find.user.id !== userId) {
      throw new ForbiddenException('Нет доступа');
    }
    return this.repository.delete(id);
  }
}
