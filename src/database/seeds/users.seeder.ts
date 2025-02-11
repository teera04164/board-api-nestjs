import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    const users = [
      {
        username: 'wittawat',
        fullName: 'Wittawat Kaewruang',
        image:
          'https://res.cloudinary.com/deu6xcg40/image/upload/v1739153360/avatar/vwxa7fg8xzslplj4rd7p.jpg',
        lastLogin: new Date(),
      },
      {
        username: 'emma',
        fullName: 'Emma Watson',
        image:
          'https://res.cloudinary.com/deu6xcg40/image/upload/v1739153360/avatar/rge3dcrzht694hq3zyhx.jpg',
        lastLogin: new Date(),
      },
      {
        username: 'ava',
        fullName: 'Ava Max',
        image:
          'https://res.cloudinary.com/deu6xcg40/image/upload/v1739153360/avatar/a2rygn8vzrhisfzkyjaa.jpg',
        lastLogin: new Date(),
      },
    ];

    return this.userRepository.save(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}
