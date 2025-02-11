import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) { }

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      postId,
      userId,
    });
    return this.commentRepository.save(comment);
  }

  async findAll(postId: string, page: number = 1, limit: number = 10) {
    page = 1;
    limit = 10;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new UnauthorizedException('You can only update your own comments');
    }

    await this.commentRepository.update(id, updateCommentDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }
}
