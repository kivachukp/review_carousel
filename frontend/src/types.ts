export interface Review {
  id: number;
  title: string;
  text: string;
  rating: number;
}

export interface ReviewsResponse {
  items: Review[];
  total: number;
}
