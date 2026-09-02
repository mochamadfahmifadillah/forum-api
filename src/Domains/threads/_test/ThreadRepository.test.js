import { describe, it, expect } from "vitest";
import ThreadRepository from "../ThreadRepository.js";

describe("ThreadRepository", () => {
  it("should throw error when addThread method is called", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.addThread()).rejects.toThrowError(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });

  it("should throw error when getThreads method is called", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.getThreads()).rejects.toThrowError(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });

  it("should throw error when getThreadById method is called", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(
      threadRepository.getThreadById("thread-123"),
    ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
