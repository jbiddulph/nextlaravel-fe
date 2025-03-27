export interface Paginator {
  current_page: number;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  total: number;
  per_page: number;
  from: number;
  to: number;
}
