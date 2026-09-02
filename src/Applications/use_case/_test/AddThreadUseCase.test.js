import { describe, it, expect, vi } from "vitest";
import AddThreadUseCase from "../AddThreadUseCase.js";

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Sebuah thread",
      body: "Sebuah body thread",
    };

    const owner = "user-123";

    const expectedAddedThread = {
      id: "thread-123",
      title: "Sebuah thread",
      body: "Sebuah body thread",
      owner: "user-123",
    };

    const threadRepository = {
      addThread: vi.fn(() => Promise.resolve(expectedAddedThread)),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(owner, useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);

    expect(threadRepository.addThread).toHaveBeenCalledWith(
      owner,
      useCasePayload,
    );

    expect(threadRepository.addThread).toHaveBeenCalledTimes(1);
  });

  it("should throw error when payload is not provided", async () => {
    // Arrange
    const threadRepository = {
      addThread: vi.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository,
    });

    // Action & Assert
    await expect(addThreadUseCase.execute("user-123")).rejects.toThrow(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );

    expect(threadRepository.addThread).not.toHaveBeenCalled();
  });

  it("should throw error when payload does not contain needed property", async () => {
    // Arrange
    const threadRepository = {
      addThread: vi.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository,
    });

    const payloadWithoutTitle = {
      body: "Sebuah body thread",
    };

    // Action & Assert
    await expect(
      addThreadUseCase.execute("user-123", payloadWithoutTitle),
    ).rejects.toThrow("THREAD.NOT_CONTAIN_NEEDED_PROPERTY");

    expect(threadRepository.addThread).not.toHaveBeenCalled();
  });

  it("should throw error when payload property has invalid data type", async () => {
    // Arrange
    const threadRepository = {
      addThread: vi.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository,
    });

    const invalidPayload = {
      title: 123,
      body: "Sebuah body thread",
    };

    // Action & Assert
    await expect(
      addThreadUseCase.execute("user-123", invalidPayload),
    ).rejects.toThrow("THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION");

    expect(threadRepository.addThread).not.toHaveBeenCalled();
  });
});
