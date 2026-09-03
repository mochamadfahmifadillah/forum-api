import { describe, it, expect, vi } from 'vitest';
import ThreadsHandler from '../handler.js';
import GetThreadsUseCase from '../../../../../Applications/use_case/GetThreadsUseCase.js';

describe('ThreadsHandler', () => {
  describe('getThreadsHandler', () => {
    it('should call next with error when get threads use case fails', async () => {
      const error = new Error('unexpected error');

      const getThreadsUseCase = {
        execute: vi.fn().mockRejectedValue(error),
      };

      const container = {
        getInstance: vi.fn((name) => {
          if (name === GetThreadsUseCase.name) {
            return getThreadsUseCase;
          }

          throw new Error(`Unexpected use case: ${name}`);
        }),
      };

      const handler = new ThreadsHandler(container);

      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await handler.getThreadsHandler(req, res, next);

      expect(container.getInstance).toHaveBeenCalledWith(
        GetThreadsUseCase.name,
      );

      expect(getThreadsUseCase.execute).toHaveBeenCalledTimes(1);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
