import { http, HttpResponse } from 'msw';

export const repositoryHandlers = [
  http.get('/api/backend/repositories', () =>
    HttpResponse.json({
      success: true,
      data: { content: [], totalElements: 0, totalPages: 1, pageNumber: 1, pageSize: 100 },
    }),
  ),
];
