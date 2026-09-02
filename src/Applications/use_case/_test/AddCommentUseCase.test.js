import { describe, it, expect, vi } from "vitest";
import AddCommentUseCase from "../AddCommentUseCase.js";

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const username = "dicoding";

    const useCasePayload = {
      content: "Sebuah komentar",
    };

    const expectedAddedComment = {
      id: "comment-123",
      content: "Sebuah komentar",
      username: "dicoding",
      thread_id: "thread-123",
    };

    const threadRepository = {
      getThreadById: vi.fn(() => Promise.resolve()),
    };

    const commentRepository = {
      addComment: vi.fn(() => Promise.resolve(expectedAddedComment)),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository,
      threadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      threadId,
      username,
      useCasePayload,
    );

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);

    expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);

    expect(commentRepository.addComment).toHaveBeenCalledWith(
      threadId,
      username,
      useCasePayload,
    );

    expect(commentRepository.addComment).toHaveBeenCalledTimes(1);
  });

  it("should throw error when content is missing", async () => {
    // Arrange
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute("thread-123", "dicoding", {}),
    ).rejects.toThrowError("COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when content has invalid data type", async () => {
    // Arrange
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute("thread-123", "dicoding", {
        content: 123,
      }),
    ).rejects.toThrowError("COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
  });
});
