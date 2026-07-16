import { http, HttpResponse } from 'msw';

export const testCaseHandlers = [
  http.get('/api/backend/repositories/:repoId/test-cases', () =>
    HttpResponse.json({
      success: true,
      data: { content: [], totalElements: 0, totalPages: 1, pageNumber: 1, pageSize: 100 },
    }),
  ),
];
