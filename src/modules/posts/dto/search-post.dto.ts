import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  LATEST = 'latest',
  POPULAR = 'popular',
}

export class SearchPostDto {
  @IsOptional()
  @IsString()
  search: string = '';

  @IsOptional()
  @ValidateIf((o) => o.communityId !== '')
  @IsUUID()
  communityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.LATEST;
}
