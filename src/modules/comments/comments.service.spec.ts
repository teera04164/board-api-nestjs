import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

const TEST_CONSTANTS = {
  POST_ID: 'post1',
  USER_ID: 'user1',
  OTHER_USER_ID: 'user2',
  COMMENT_ID: 'comment1',
  CONTENT: 'Test comment',
} as const;

interface PaginationParams {
  page: number;
  limit: number;
  totalPages: number;
}

const mockComment: Comment = {
  id: TEST_CONSTANTS.COMMENT_ID,
  content: TEST_CONSTANTS.CONTENT,
  postId: TEST_CONSTANTS.POST_ID,
  userId: TEST_CONSTANTS.USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: null,
  post: null,
};

const defaultPaginationParams: PaginationParams = {
  page: 1,
  limit: 10,
  totalPages: 1,
};

const mockCommentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: jest.Mocked<Repository<Comment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get(getRepositoryToken(Comment));

    jest.clearAllMocks();
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(commentRepository).toBeDefined();
    });
  });

  describe('create', () => {
    const createCommentDto: CreateCommentDto = {
      content: TEST_CONSTANTS.CONTENT,
    };

    it('should create and return a comment', async () => {
      commentRepository.create.mockReturnValue(mockComment);
      commentRepository.save.mockResolvedValue(mockComment);

      const result = await service.create(
        TEST_CONSTANTS.POST_ID,
        createCommentDto,
        TEST_CONSTANTS.USER_ID,
      );

      expect(result).toEqual(mockComment);
      expect(commentRepository.create).toHaveBeenCalledWith({
        content: TEST_CONSTANTS.CONTENT,
        postId: TEST_CONSTANTS.POST_ID,
        userId: TEST_CONSTANTS.USER_ID,
      });
      expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
    });

    it('should throw an error when save fails', async () => {
      const errorMessage = 'Failed to save comment';
      commentRepository.create.mockReturnValue(mockComment);
      commentRepository.save.mockRejectedValue(new Error(errorMessage));

      await expect(
        service.create(
          TEST_CONSTANTS.POST_ID,
          createCommentDto,
          TEST_CONSTANTS.USER_ID,
        ),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      const mockComments = [mockComment];
      const totalCount = 1;
      commentRepository.findAndCount.mockResolvedValue([
        mockComments,
        totalCount,
      ]);

      const result = await service.findAll(
        TEST_CONSTANTS.POST_ID,
        defaultPaginationParams.page,
        defaultPaginationParams.limit,
      );

      expect(result).toEqual({
        comments: mockComments,
        pagination: {
          page: defaultPaginationParams.page,
          total: totalCount,
          totalPages: defaultPaginationParams.totalPages,
        },
      });
      expect(commentRepository.findAndCount).toHaveBeenCalledWith({
        where: { postId: TEST_CONSTANTS.POST_ID },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: defaultPaginationParams.limit,
      });
    });

    it('should return empty array when no comments exist', async () => {
      commentRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(
        TEST_CONSTANTS.POST_ID,
        defaultPaginationParams.page,
        defaultPaginationParams.limit,
      );

      expect(result.comments).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle pagination parameters correctly', async () => {
      const page = 2;
      const limit = 5;
      commentRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(TEST_CONSTANTS.POST_ID, page, limit);

      expect(commentRepository.findAndCount).toHaveBeenCalledWith({
        where: { postId: TEST_CONSTANTS.POST_ID },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });
  });

  describe('remove', () => {
    it('should delete a comment successfully', async () => {
      commentRepository.findOne.mockResolvedValue(mockComment);
      commentRepository.remove.mockResolvedValue(undefined);

      await expect(
        service.remove(TEST_CONSTANTS.COMMENT_ID, TEST_CONSTANTS.USER_ID),
      ).resolves.toBeUndefined();

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_CONSTANTS.COMMENT_ID },
        relations: ['user'],
      });
      expect(commentRepository.remove).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      commentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(TEST_CONSTANTS.COMMENT_ID, TEST_CONSTANTS.USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      const unauthorizedComment = {
        ...mockComment,
        userId: TEST_CONSTANTS.OTHER_USER_ID,
      };
      commentRepository.findOne.mockResolvedValue(unauthorizedComment);

      await expect(
        service.remove(TEST_CONSTANTS.COMMENT_ID, TEST_CONSTANTS.USER_ID),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
