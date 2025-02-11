import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { Post } from '../../modules/posts/entities/post.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Community } from '../../modules/communities/entities/community.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class PostsSeeder implements Seeder {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async seed(): Promise<any> {
    const users = await this.userRepository.find();
    const communities = await this.communityRepository.find();

    const posts = Array.from({ length: 10 }).map(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCommunity =
        communities[Math.floor(Math.random() * communities.length)];
      const randomContent = Math.floor(Math.random() * 15);

      return {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(randomContent),
        user: randomUser,
        community: randomCommunity,
      };
    });

    return this.postRepository.save(posts);
  }

  async drop(): Promise<any> {
    return this.postRepository.delete({});
  }
}
