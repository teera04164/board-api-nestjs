import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { Community } from 'src/modules/communities/entities/community.entity';

@Injectable()
export class CommunitiesSeeder implements Seeder {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async seed(): Promise<any> {
    const communities = [
      {
        name: 'History',
        order: 1,
      },
      {
        name: 'Food',
        order: 2,
      },
      {
        name: 'Pets',
        order: 3,
      },
      {
        name: 'Health',
        order: 4,
      },
      {
        name: 'Fashion',
        order: 5,
      },
      {
        name: 'Exercise',
        order: 6,
      },
      {
        name: 'Others',
        order: 7,
      },
    ];

    return this.communityRepository.save(communities);
  }

  async drop(): Promise<void> {
    try {
      await this.communityRepository.delete({});
      console.log('Dropped all communities');
    } catch (error) {
      console.error('Error dropping communities:', error);
      throw error;
    }
  }
}
