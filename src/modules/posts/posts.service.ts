import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
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

  private createQueryForPosts(searchPostDto: SearchPostDto, userId?: string) {
    const offset = (searchPostDto.page - 1) * searchPostDto.limit;
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
      .groupBy('post.id')
      .addGroupBy('user.id')
      .addGroupBy('community.id')
      .orderBy('post.createdAt', 'DESC');

    if (searchPostDto.search) {
      queryBuilder.andWhere(
        'post.title LIKE :search OR post.content LIKE :search',
        { search: `%${searchPostDto.search}%` },
      );
    }

    if (searchPostDto.communityId) {
      queryBuilder.andWhere('post.communityId = :communityId', {
        communityId: searchPostDto.communityId,
      });
    }

    if (userId) {
      queryBuilder.andWhere('post.userId = :userId', {
        userId,
      });
    }

    queryBuilder.offset(offset).limit(searchPostDto.limit);
    return queryBuilder;
  }

  private async fetchPostsData(
    searchPostDto: SearchPostDto,
    queryBuilder: SelectQueryBuilder<Post>,
  ) {
    const [postsRaw, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);

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
        page: searchPostDto.page,
        totalPages: Math.ceil(total / searchPostDto.limit),
      },
    };
  }

  async findAll(searchPostDto: SearchPostDto) {
    const queryBuilder = this.createQueryForPosts(searchPostDto);
    return this.fetchPostsData(searchPostDto, queryBuilder);
  }

  async findByUser(userId: string, searchPostDto: SearchPostDto) {
    const queryBuilder = this.createQueryForPosts(searchPostDto, userId);
    return this.fetchPostsData(searchPostDto, queryBuilder);
  }

  async findOne(id: string) {
    const [post, commentCount] = await Promise.all([
      this.postRepository.findOne({
        where: { id },
        relations: ['user', 'community'],
      }),
      this.commentRepository.count({
        where: { post: { id } },
      }),
    ]);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      commentCount,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: any) {
    const post = await this.findOne(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const comunity = await this.communityRepository.findOne({
      where: { id: updatePostDto.communityId },
    });

    Object.assign(post, { ...updatePostDto, community: comunity });
    return this.postRepository.save(post);
  }

  async remove(id: string, user: any) {
    const post = await this.findOne(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
    return { message: 'Post deleted successfully' };
  }

  async getComments(postId: string, { page = 1, limit = 10 }) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { post: { id: postId } },
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
}
