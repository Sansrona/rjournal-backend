import { CommentEntity } from './entities/comment.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  create(dto: CreateCommentDto, userId: number) {
    return this.repository.save({
      text: dto.text,
      post: { id: dto.postId },
      user: { id: userId },
    });
  }

  async findAll() {
    const result = await this.repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('c.user', 'user')
      .getMany();

    return result.map((obj) => ({
      ...obj,
      post: { id: obj.post.id },
    }));
  }

  findOne(id: number) {
    return this.repository.findOne(+id);
  }

  update(id: number, dto: UpdateCommentDto) {
    return this.repository.update(id, dto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
