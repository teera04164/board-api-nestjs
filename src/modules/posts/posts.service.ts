import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { Comment } from '../comments/entities/comment.entity';
import { Community } from '../communities/entities/community.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto, user: any) {
    const community = await this.communityRepository.findOne({
      where: { id: createPostDto.communityId },
    });
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const post = this.postRepository.create({
      ...createPostDto,
      community,
      user,
    });
    return this.postRepository.save(post);
  }
}
