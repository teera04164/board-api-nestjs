import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../modules/users/entities/user.entity';
import { CommunitiesSeeder } from './communities.seeder';
import { Community } from 'src/modules/communities/entities/community.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Comment } from 'src/modules/comments/entities/comment.entity';
import { UsersSeeder } from './users.seeder';
import { PostsSeeder } from './posts.seeder';
import { CommentsSeeder } from './comment.seeder';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Community, Post, User, Comment],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Community, Post, User, Comment]),
  ],
  providers: [CommunitiesSeeder, UsersSeeder, PostsSeeder, CommentsSeeder],
})
export class SeederModule {}
