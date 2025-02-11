import { PipeTransform, Injectable } from '@nestjs/common';
import { SearchPostDto, SortBy } from '../dto/search-post.dto';

@Injectable()
export class SearchQueryPipe implements PipeTransform {
  transform(value: any): SearchPostDto {
    const dto = new SearchPostDto();

    dto.search = value.search || '';
    dto.communityId = value.communityId;
    dto.page = Number(value.page) || 1;
    dto.limit = Number(value.limit) || 99999;
    dto.sortBy = value.sortBy || SortBy.LATEST;

    return dto;
  }
}
