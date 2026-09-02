import { describe, it, expect, vi } from "vitest";
import AddReplyUseCase from "../AddReplyUseCase.js";

describe("AddReplyUseCase", () => {
  it("should orchestrate the add reply action correctly", async () => {
    // Arrange
    const owner = "dicoding";
    const threadId = "thread-123";
    const commentId = "comment-123";

    const useCasePayload = {
      content: "Sebuah balasan",
    };

    const expectedAddedReply = {
      id: "reply-123",
      content: "Sebuah balasan",
      username: "dicoding",
      comment_id: "comment-123",
    };

    const threadRepository = {
      getThreadById: vi.fn(() => Promise.resolve()),
    };

    const commentRepository = {
      getCommentsByThreadId: vi.fn(() =>
        Promise.resolve([
          {
            id: "comment-123",
            username: "user",
            content: "Sebuah komentar",
          },
        ]),
      ),
    };

    const replyRepository = {
      addReply: vi.fn(() => Promise.resolve(expectedAddedReply)),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository,
      commentRepository,
      threadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      owner,
      threadId,
      commentId,
      useCasePayload,
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);

    expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);

    expect(commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );

    expect(replyRepository.addReply).toHaveBeenCalledWith(
      owner,
      commentId,
      useCasePayload,
    );

    expect(replyRepository.addReply).toHaveBeenCalledTimes(1);
  });

  it("should throw error when content is missing", async () => {
    // Arrange
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: {},
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute("dicoding", "thread-123", "comment-123", {}),
    ).rejects.toThrowError("REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when content has invalid data type", async () => {
    // Arrange
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: {},
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute("dicoding", "thread-123", "comment-123", {
        content: 123,
      }),
    ).rejects.toThrowError("REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
  });

  it("should throw error when comment is not found", async () => {
    // Arrange
    const threadRepository = {
      getThreadById: vi.fn(() => Promise.resolve()),
    };

    const commentRepository = {
      getCommentsByThreadId: vi.fn(() => Promise.resolve([])),
    };

    const replyRepository = {
      addReply: vi.fn(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository,
      commentRepository,
      threadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute("dicoding", "thread-123", "comment-999", {
        content: "Sebuah balasan",
      }),
    ).rejects.toThrowError("COMMENT.NOT_FOUND");

    expect(replyRepository.addReply).not.toHaveBeenCalled();
  });
});
