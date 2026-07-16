import { repositoryHandlers } from './repository.handlers';
import { testCaseHandlers } from './testCase.handlers';

export const handlers = [...repositoryHandlers, ...testCaseHandlers];
