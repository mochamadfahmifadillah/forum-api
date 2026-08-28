import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
    };

    const owner = 'user-123';

    const expectedAddedThread = {
      id: 'thread-123',
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
      owner: 'user-123',
    };

    const threadRepository = {
      addThread: vi.fn(() => Promise.resolve(expectedAddedThread)),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(
      owner,
      useCasePayload,
    );

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);

    expect(threadRepository.addThread).toHaveBeenCalledWith(
      owner,
      useCasePayload,
    );

    expect(threadRepository.addThread).toHaveBeenCalledTimes(1);
  });
});
