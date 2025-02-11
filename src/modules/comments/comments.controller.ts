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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user,
  ) {
    return this.commentsService.create(postId, createCommentDto, user.id);
  }
}
