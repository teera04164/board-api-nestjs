import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async findAll() {
    return this.communityRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    return this.communityRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
  }

  async create(createCommunityDto: CreateCommunityDto) {
    const community = this.communityRepository.create(createCommunityDto);
    return this.communityRepository.save(community);
  }
}
