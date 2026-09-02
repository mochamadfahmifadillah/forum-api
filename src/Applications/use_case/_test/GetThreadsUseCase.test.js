import { describe, it, expect, vi } from "vitest";
import GetThreadsUseCase from "../GetThreadsUseCase.js";

describe("GetThreadsUseCase", () => {
  it("should orchestrate the get threads action correctly", async () => {
    // Arrange
    const expectedThreads = [
      {
        id: "thread-123",
        title: "Thread pertama",
        body: "Isi thread pertama",
        date: new Date().toISOString(),
        username: "dicoding",
      },
      {
        id: "thread-456",
        title: "Thread kedua",
        body: "Isi thread kedua",
        date: new Date().toISOString(),
        username: "user",
      },
    ];

    const threadRepository = {
      getThreads: vi.fn(() => Promise.resolve(expectedThreads)),
    };

    const getThreadsUseCase = new GetThreadsUseCase({
      threadRepository,
    });

    // Action
    const threads = await getThreadsUseCase.execute();

    // Assert
    expect(threads).toStrictEqual(expectedThreads);

    expect(threadRepository.getThreads).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when there are no threads", async () => {
    // Arrange
    const threadRepository = {
      getThreads: vi.fn(() => Promise.resolve([])),
    };

    const getThreadsUseCase = new GetThreadsUseCase({
      threadRepository,
    });

    // Action
    const threads = await getThreadsUseCase.execute();

    // Assert
    expect(threads).toStrictEqual([]);

    expect(threadRepository.getThreads).toHaveBeenCalledTimes(1);
  });
});
