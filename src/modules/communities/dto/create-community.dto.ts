import { IsString, MinLength } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  @MinLength(3)
  name: string;
}
