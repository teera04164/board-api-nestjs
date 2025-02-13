import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Community } from '../communities/entities/community.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Community, Comment])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
