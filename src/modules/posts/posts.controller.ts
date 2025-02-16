import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UnauthorizedException, ForbiddenException
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  async findAll(@Query() searchPostDto: SearchPostDto) {
    return this.postsService.findAll(searchPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUserPosts(
    @CurrentUser() user,
    @Query() searchPostDto: SearchPostDto,
  ) {
    return this.postsService.findByUser(user.id,searchPostDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() user) {
    return this.postsService.create(createPostDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user,
  ) {
    const post = await this.postsService.findOne(id);

    if (post.user.id !== user.id) {
      throw new UnauthorizedException('You can only update your own posts');
    }

    return this.postsService.update(id, updatePostDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user) {
    const post = await this.postsService.findOne(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.postsService.remove(id, user);
  }

}
