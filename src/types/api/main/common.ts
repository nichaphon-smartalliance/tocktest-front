export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PageObject<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
