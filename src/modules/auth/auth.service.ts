import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.usersService.create(registerDto);
    await this.usersService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        image: user.image,
        lastLogin: user.lastLogin,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid username');
    }

    await this.usersService.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        image: user.image,
        lastLogin: user.lastLogin,
      },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        image: user.image,
        lastLogin: user.lastLogin,
      },
    };
  }

  private async generateTokens(user: any) {
    const accessToken = await this.generateAccessToken(user);
    return {
      accessToken,
    };
  }

  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRED_IN'),
    });
  }
}
