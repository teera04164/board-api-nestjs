import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunitiesService } from './communities.service';
import { NotFoundException } from '@nestjs/common';

const TEST_CONSTANTS = {
  COMMUNITY_ID: 'community1',
  USER_ID: 'user1',
  OTHER_USER_ID: 'user2',
  COMMUNITY_NAME: 'Test Community'
} as const;

const mockCommunity: Community = {
  id: TEST_CONSTANTS.COMMUNITY_ID,
  name: TEST_CONSTANTS.COMMUNITY_NAME,
  createdAt: new Date(),
  updatedAt: new Date(),
  posts: [],
  order: 0,
};

const mockCommunityRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};
describe('CommunitiesService', () => {
  let service: CommunitiesService;
  let communityRepository: jest.Mocked<Repository<Community>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        {
          provide: getRepositoryToken(Community),
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
    communityRepository = module.get(getRepositoryToken(Community));

    jest.clearAllMocks();
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(communityRepository).toBeDefined();
    });
  });

  describe('create', () => {
    const createCommunityDto: CreateCommunityDto = {
      name: TEST_CONSTANTS.COMMUNITY_NAME
    };

    it('should create and return a community', async () => {
      communityRepository.create.mockReturnValue(mockCommunity);
      communityRepository.save.mockResolvedValue(mockCommunity);

      const result = await service.create(createCommunityDto);

      expect(result).toEqual(mockCommunity);
      expect(communityRepository.create).toHaveBeenCalledWith({
        name: TEST_CONSTANTS.COMMUNITY_NAME,
      });
      expect(communityRepository.save).toHaveBeenCalledWith(mockCommunity);
    });

    it('should throw an error when save fails', async () => {
      const errorMessage = 'Failed to save community';
      communityRepository.create.mockReturnValue(mockCommunity);
      communityRepository.save.mockRejectedValue(new Error(errorMessage));

      await expect(
        service.create(createCommunityDto)
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should return an array of communities', async () => {
      const mockCommunities = [mockCommunity];
      communityRepository.find.mockResolvedValue(mockCommunities);

      const result = await service.findAll();

      expect(result).toEqual(mockCommunities);
      expect(communityRepository.find).toHaveBeenCalledWith({
        order: {
          order: 'ASC',
        },
      });
    });

    it('should return empty array when no communities exist', async () => {
      communityRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(communityRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single community when found', async () => {
      communityRepository.findOne.mockResolvedValue(mockCommunity);

      const result = await service.findOne(TEST_CONSTANTS.COMMUNITY_ID);

      expect(result).toEqual(mockCommunity);
      expect(communityRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_CONSTANTS.COMMUNITY_ID },
        relations: ['posts'],
      });
    });

    it('should throw NotFoundException when community is not found', async () => {
      communityRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(TEST_CONSTANTS.COMMUNITY_ID)
      ).rejects.toThrow(NotFoundException);
    });
  });

});