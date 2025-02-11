import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
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

  async findAll(SearchPostDto: SearchPostDto) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.community', 'community')
      .leftJoin('post.comments', 'comments')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.createdAt',
        'post.updatedAt',
        'user.id',
        'user.username',
        'user.fullName',
        'user.image',
        'community.id',
        'community.name',
      ])
      .addSelect('COUNT(DISTINCT comments.id)', 'commentCount')
      .groupBy('post.id, user.id, community.id')
      .orderBy('post.createdAt', 'DESC')
      .skip((SearchPostDto.page - 1) * SearchPostDto.limit)
      .take(SearchPostDto.limit);

    if (SearchPostDto.search) {
      queryBuilder.andWhere(
        'post.title LIKE :search OR post.content LIKE :search',
        { search: `%${SearchPostDto.search}%` },
      );
    }

    if (SearchPostDto.communityId) {
      queryBuilder.andWhere('post.communityId = :communityId', {
        communityId: SearchPostDto.communityId,
      });
    }

    const postsRaw = await queryBuilder.getRawMany();
    const total = await this.postRepository.count();

    const postsWithCommentCount = postsRaw.map((post) => ({
      id: post.post_id,
      title: post.post_title,
      content:
        post.post_content.length > 100
          ? `${post.post_content.substring(0, 100)}...`
          : post.post_content,
      createdAt: post.post_createdAt,
      updatedAt: post.post_updatedAt,
      user: {
        id: post.user_id,
        username: post.user_username,
        fullName: post.user_fullName,
        image: post.user_image,
      },
      community: {
        id: post.community_id,
        name: post.community_name,
      },
      commentCount: Number(post.commentCount || 0),
    }));

    return {
      posts: postsWithCommentCount,
      pagination: {
        total,
        page: SearchPostDto.page,
        totalPages: Math.ceil(total / SearchPostDto.limit),
      },
    };
  }

  async findByUser(
    userId: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      posts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'community'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

}
