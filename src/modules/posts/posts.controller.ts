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
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SearchQueryPipe } from './pipes/search-query.pipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }), SearchQueryPipe)
  async findAll(@Query() searchPostDto: SearchPostDto) {
    return this.postsService.findAll(searchPostDto);
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

}
