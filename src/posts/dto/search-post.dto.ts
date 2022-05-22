export class SearchPostDto {
  title?: string;
  body?: string;
  views?: 'ASC' | 'DESC';
  take?: number;
  limit?: number;
  tag?: string;
}
