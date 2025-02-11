import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunitiesService } from './communities.service';

describe('CommunitiesService', () => {
  let service: CommunitiesService;
  let repository: Repository<Community>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        {
          provide: getRepositoryToken(Community),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
    repository = module.get<Repository<Community>>(
      getRepositoryToken(Community),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of communities', async () => {
      const communities = [{ id: '1', name: 'Community 1' }];
      jest.spyOn(repository, 'find').mockResolvedValue(communities as any);

      expect(await service.findAll()).toEqual(communities);
    });
  });

  describe('findOne', () => {
    it('should return a single community', async () => {
      const community = { id: '1', name: 'Community 1' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(community as any);

      expect(await service.findOne('1')).toEqual(community);
    });
  });

  describe('create', () => {
    it('should create and return a community', async () => {
      const createCommunityDto: CreateCommunityDto = { name: 'New Community' };
      const community = { id: '1', ...createCommunityDto };
      jest.spyOn(repository, 'create').mockReturnValue(community as any);
      jest.spyOn(repository, 'save').mockResolvedValue(community as any);

      expect(await service.create(createCommunityDto)).toEqual(community);
    });
  });
});
