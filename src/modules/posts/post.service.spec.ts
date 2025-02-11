import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Community } from '../communities/entities/community.entity';
import { Comment } from '../comments/entities/comment.entity';
import { SearchPostDto, SortBy } from './dto/search-post.dto';

const TEST_CONSTANTS = {
  POST_ID: '1',
  USER_ID: 'user1',
  OTHER_USER_ID: 'user2',
  COMMUNITY_ID: '123',
  POST_TITLE: 'Test Post',
  POST_CONTENT: 'This is a test post',
};

const mockUser = {
  id: TEST_CONSTANTS.USER_ID,
  username: 'testuser',
};

const mockCommunity = {
  id: TEST_CONSTANTS.COMMUNITY_ID,
  name: 'Test Community',
};

const mockPost = {
  id: TEST_CONSTANTS.POST_ID,
  title: TEST_CONSTANTS.POST_TITLE,
  content: TEST_CONSTANTS.POST_CONTENT,
  user: mockUser,
  community: mockCommunity,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const queryBuilderMock = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]),
};

const mockRepositories = {
  post: {
    findOne: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilderMock),
  },
  community: {
    findOne: jest.fn(),
  },
  comment: {
    find: jest.fn(),
  },
};

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: Repository<Post>;
  let communityRepository: Repository<Community>;
  let commentRepository: Repository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepositories.post,
        },
        {
          provide: getRepositoryToken(Community),
          useValue: mockRepositories.community,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepositories.comment,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    communityRepository = module.get<Repository<Community>>(
      getRepositoryToken(Community),
    );
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPostDto: CreatePostDto = {
      title: TEST_CONSTANTS.POST_TITLE,
      content: TEST_CONSTANTS.POST_CONTENT,
      communityId: TEST_CONSTANTS.COMMUNITY_ID,
    };

    it('should create and return a post', async () => {
      mockRepositories.community.findOne.mockResolvedValue(mockCommunity);
      mockRepositories.post.create.mockReturnValue(mockPost);
      mockRepositories.post.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto, mockUser);

      expect(result).toEqual(mockPost);
      expect(mockRepositories.community.findOne).toHaveBeenCalledWith({
        where: { id: TEST_CONSTANTS.COMMUNITY_ID },
      });
      expect(mockRepositories.post.save).toHaveBeenCalledWith(mockPost);
    });

    it('should throw NotFoundException if community does not exist', async () => {
      mockRepositories.community.findOne.mockResolvedValue(null);

      await expect(service.create(createPostDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    const defaultSearchDto: SearchPostDto = {
      page: 1,
      limit: 10,
      search: '',
      communityId: '',
      sortBy: SortBy.LATEST,
    };

    const mockRawPost = {
      post_id: TEST_CONSTANTS.POST_ID,
      post_title: TEST_CONSTANTS.POST_TITLE,
      post_content: TEST_CONSTANTS.POST_CONTENT,
      post_createdAt: new Date(),
      post_updatedAt: new Date(),
      user_id: TEST_CONSTANTS.USER_ID,
      user_username: 'testuser',
      user_fullName: 'Test User',
      user_image: 'image_url',
      community_id: TEST_CONSTANTS.COMMUNITY_ID,
      community_name: 'Test Community',
      commentCount: '5',
    };

    it('should return paginated posts with comment counts', async () => {
      queryBuilderMock.getRawMany.mockResolvedValue([mockRawPost]);
      mockRepositories.post.count.mockResolvedValue(1);

      const result = await service.findAll(defaultSearchDto);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(TEST_CONSTANTS.POST_ID);
      expect(result.posts[0].commentCount).toBe(5);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a post by ID', async () => {
      mockRepositories.post.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(TEST_CONSTANTS.POST_ID);

      expect(result).toEqual(mockPost);
      expect(mockRepositories.post.findOne).toHaveBeenCalledWith({
        where: { id: TEST_CONSTANTS.POST_ID },
        relations: ['user', 'community'],
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockRepositories.post.findOne.mockResolvedValue(null);

      await expect(service.findOne(TEST_CONSTANTS.POST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Updated Title' };

    it('should update a post successfully', async () => {
      mockRepositories.post.findOne.mockResolvedValue(mockPost);
      mockRepositories.post.save.mockResolvedValue({
        ...mockPost,
        ...updateDto,
      });

      const result = await service.update(
        TEST_CONSTANTS.POST_ID,
        updateDto,
        mockUser,
      );

      expect(result.title).toBe('Updated Title');
      expect(mockRepositories.post.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not post owner', async () => {
      const differentUser = { id: TEST_CONSTANTS.OTHER_USER_ID };
      mockRepositories.post.findOne.mockResolvedValue(mockPost);

      await expect(
        service.update(TEST_CONSTANTS.POST_ID, updateDto, differentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      mockRepositories.post.findOne.mockResolvedValue(mockPost);
      mockRepositories.post.remove.mockResolvedValue(mockPost);

      const result = await service.remove(TEST_CONSTANTS.POST_ID, mockUser);

      expect(result).toEqual({ message: 'Post deleted successfully' });
    });

    it('should throw ForbiddenException if user is not post owner', async () => {
      const differentUser = { id: TEST_CONSTANTS.OTHER_USER_ID };
      mockRepositories.post.findOne.mockResolvedValue(mockPost);

      await expect(
        service.remove(TEST_CONSTANTS.POST_ID, differentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
