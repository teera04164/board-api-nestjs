import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

const TEST_POST_ID = 'post1';
const TEST_USER_ID = 'user1';
const TEST_COMMENT_ID = 'comment1';
const TEST_CONTENT = 'Test comment';
const OTHER_USER_ID = 'user2';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;

  const mockComment = {
    id: TEST_COMMENT_ID,
    content: TEST_CONTENT,
    postId: TEST_POST_ID,
    userId: TEST_USER_ID,
  };

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

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
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCommentDto: CreateCommentDto = { content: TEST_CONTENT };

    it('should create and return a comment', async () => {
      mockCommentRepository.create.mockReturnValue(mockComment);
      mockCommentRepository.save.mockResolvedValue(mockComment);

      const result = await service.create(
        TEST_POST_ID,
        createCommentDto,
        TEST_USER_ID,
      );

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        content: TEST_CONTENT,
        postId: TEST_POST_ID,
        userId: TEST_USER_ID,
      });
      expect(mockCommentRepository.save).toHaveBeenCalledWith(mockComment);
    });
  });

  describe('findAll', () => {
    const defaultPaginationParams = {
      page: 1,
      totalPages: 1,
      limit: 10,
    };

    it('should return paginated comments', async () => {
      const mockComments = [mockComment];
      const totalCount = 1;
      mockCommentRepository.findAndCount.mockResolvedValue([
        mockComments,
        totalCount,
      ]);

      const result = await service.findAll(
        TEST_POST_ID,
        defaultPaginationParams.page,
        defaultPaginationParams.limit,
      );

      expect(result.comments).toEqual(mockComments);
      expect(result.pagination).toEqual({
        page: defaultPaginationParams.page,
        total: totalCount,
        totalPages: defaultPaginationParams.totalPages,
      });
      expect(mockCommentRepository.findAndCount).toHaveBeenCalledWith({
        where: { postId: TEST_POST_ID },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: defaultPaginationParams.limit,
      });
    });
  });

  describe('remove', () => {
    it('should delete a comment successfully', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.remove.mockResolvedValue(undefined);

      await expect(
        service.remove(TEST_COMMENT_ID, TEST_USER_ID),
      ).resolves.toBeUndefined();

      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_COMMENT_ID },
        relations: ['user'],
      });
      expect(mockCommentRepository.remove).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(TEST_COMMENT_ID, TEST_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      const unauthorizedComment = { ...mockComment, userId: OTHER_USER_ID };
      mockCommentRepository.findOne.mockResolvedValue(unauthorizedComment);

      await expect(
        service.remove(TEST_COMMENT_ID, TEST_USER_ID),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
