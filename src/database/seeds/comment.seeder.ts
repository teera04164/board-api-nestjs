import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { Comment } from '../../modules/comments/entities/comment.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Post } from '../../modules/posts/entities/post.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class CommentsSeeder implements Seeder {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async seed(): Promise<any> {
    const users = await this.userRepository.find();
    const posts = await this.postRepository.find();

    const comments = posts.flatMap((post) => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const numComments = faker.number.int({ min: 1, max: 3 });

      return Array.from({ length: numComments }).map(() => {
        return {
          content: faker.lorem.sentence(),
          user: randomUser,
          post: post,
          userId: randomUser.id,
          postId: post.id,
        };
      });
    });

    return this.commentRepository.save(comments);
  }

  async drop(): Promise<any> {
    return this.commentRepository.delete({});
  }
}
