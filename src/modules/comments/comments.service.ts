import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

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

}
