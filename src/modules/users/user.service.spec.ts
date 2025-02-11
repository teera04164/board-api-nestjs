import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        fullName: 'Test User',
        image: 'https://example.com/image.jpg',
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockResolvedValue(createUserDto);

      const result = await service.create(createUserDto);
      expect(result).toEqual(createUserDto);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if username already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ username: 'testuser' });

      await expect(
        service.create({
          username: 'testuser',
          fullName: 'Test User',
          image: '',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', username: 'testuser', fullName: 'Test User', image: '' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        fullName: 'Test User',
        image: '',
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
