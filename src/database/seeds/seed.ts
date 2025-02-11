import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { CommunitiesSeeder } from './communities.seeder';
import { UsersSeeder } from './users.seeder';
import { PostsSeeder } from './posts.seeder';
import { CommentsSeeder } from './comment.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);

  const usersSeeder = appContext.get(UsersSeeder);
  const communitiesSeeder = appContext.get(CommunitiesSeeder);
  const postsSeeder = appContext.get(PostsSeeder);
  const commentsSeeder = appContext.get(CommentsSeeder);

  try {
    if (process.argv.includes('--drop')) {
      await commentsSeeder.drop();
      await postsSeeder.drop();
      await communitiesSeeder.drop();
      await usersSeeder.drop();
      console.log('Drop completed!');
    } else {
      await usersSeeder.seed();
      await communitiesSeeder.seed();
      await postsSeeder.seed();
      await commentsSeeder.seed();
      console.log('Seeding completed!');
    }
  } catch (error) {
    console.error('Seeding failed!', error);
  } finally {
    await appContext.close();
  }
}

bootstrap();
