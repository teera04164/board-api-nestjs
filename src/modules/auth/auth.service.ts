import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
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
}
