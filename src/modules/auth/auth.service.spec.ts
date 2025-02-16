import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const TEST_CONSTANTS = {
  USER_ID: 'user1',
  USERNAME: 'testuser',
  FULL_NAME: 'Test User',
  IMAGE: 'test-image.jpg',
  PASSWORD: 'password123',
  ACCESS_TOKEN: 'test-access-token',
  JWT_ACCESS_SECRET: 'test-secret',
  JWT_ACCESS_EXPIRED_IN: '15m',
} as const;

const mockUser = {
  id: TEST_CONSTANTS.USER_ID,
  username: TEST_CONSTANTS.USERNAME,
  fullName: TEST_CONSTANTS.FULL_NAME,
  image: TEST_CONSTANTS.IMAGE,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  posts: [],
  comments: [],
};

const mockUserResponse = {
  user: {
    id: TEST_CONSTANTS.USER_ID,
    username: TEST_CONSTANTS.USERNAME,
    fullName: TEST_CONSTANTS.FULL_NAME,
    image: TEST_CONSTANTS.IMAGE,
    lastLogin: mockUser.lastLogin,
  },
};

const mockUsersService = {
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateLastLogin: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    jest.clearAllMocks();

    configService.get.mockImplementation((key: string) => {
      const config = {
        JWT_ACCESS_SECRET: TEST_CONSTANTS.JWT_ACCESS_SECRET,
        JWT_ACCESS_EXPIRED_IN: TEST_CONSTANTS.JWT_ACCESS_EXPIRED_IN,
      };
      return config[key];
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(usersService).toBeDefined();
      expect(jwtService).toBeDefined();
      expect(configService).toBeDefined();
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: TEST_CONSTANTS.USERNAME,
      fullName: TEST_CONSTANTS.FULL_NAME,
    };

    it('should register a new user successfully', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      usersService.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUserResponse);
      expect(usersService.findByUsername).toHaveBeenCalledWith(
        TEST_CONSTANTS.USERNAME,
      );
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(
        TEST_CONSTANTS.USER_ID,
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: TEST_CONSTANTS.USERNAME,
    };

    beforeEach(() => {
      jwtService.signAsync.mockResolvedValue(TEST_CONSTANTS.ACCESS_TOKEN);
    });

    it('should login user successfully', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      usersService.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toEqual(mockUserResponse);
      expect(usersService.findByUsername).toHaveBeenCalledWith(
        TEST_CONSTANTS.USERNAME,
      );
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(
        TEST_CONSTANTS.USER_ID,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: TEST_CONSTANTS.USER_ID,
          username: TEST_CONSTANTS.USERNAME,
          type: 'access',
        },
        {
          secret: TEST_CONSTANTS.JWT_ACCESS_SECRET,
          expiresIn: TEST_CONSTANTS.JWT_ACCESS_EXPIRED_IN,
        },
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile(TEST_CONSTANTS.USER_ID);

      expect(result).toEqual(mockUserResponse);
      expect(usersService.findById).toHaveBeenCalledWith(
        TEST_CONSTANTS.USER_ID,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getProfile(TEST_CONSTANTS.USER_ID)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
