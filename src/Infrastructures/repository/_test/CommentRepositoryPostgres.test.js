import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

import CommentRepositoryPostgres from "../CommentRepositoryPostgres.js";

describe("CommentRepositoryPostgres", () => {
  let pool;
  let idGenerator;
  let commentRepositoryPostgres;

  beforeEach(() => {
    pool = {
      query: vi.fn(),
    };

    idGenerator = vi.fn(() => "123");

    commentRepositoryPostgres = new CommentRepositoryPostgres(
      pool,
      idGenerator,
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should persist new comment", async () => {
    // Arrange
    const threadId = "thread-123";
    const username = "dicoding";

    const payload = {
      content: "Sebuah komentar",
    };

    pool.query.mockResolvedValue({
      rows: [
        {
          id: "comment-123",
          content: "Sebuah komentar",
          date: new Date().toISOString(),
          username: "dicoding",
          thread_id: "thread-123",
        },
      ],
    });

    // Action
    const addedComment = await commentRepositoryPostgres.addComment(
      threadId,
      username,
      payload,
    );

    // Assert
    expect(idGenerator).toHaveBeenCalledTimes(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.objectContaining({
        values: ["comment-123", payload.content, username, threadId],
      }),
    );

    expect(addedComment.id).toBe("comment-123");
    expect(addedComment.content).toBe(payload.content);
    expect(addedComment.username).toBe(username);
    expect(addedComment.threadId).toBe(threadId);
  });

  it("should delete comment when owner is correct", async () => {
    // Arrange
    const commentId = "comment-123";
    const owner = "dicoding";

    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: commentId,
            username: owner,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [],
      });

    // Action
    await commentRepositoryPostgres.deleteComment(commentId, owner);

    // Assert
    expect(pool.query).toHaveBeenCalledTimes(2);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        values: [commentId],
      }),
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        values: [commentId],
      }),
    );
  });

  it("should throw error when comment is not found", async () => {
    // Arrange
    const commentId = "comment-123";

    pool.query.mockResolvedValue({
      rows: [],
    });

    // Action & Assert
    await expect(
      commentRepositoryPostgres.deleteComment(commentId, "dicoding"),
    ).rejects.toThrowError("COMMENT.NOT_FOUND");

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("should throw error when user is not the comment owner", async () => {
    // Arrange
    const commentId = "comment-123";

    pool.query.mockResolvedValue({
      rows: [
        {
          id: commentId,
          username: "owner",
        },
      ],
    });

    // Action & Assert
    await expect(
      commentRepositoryPostgres.deleteComment(commentId, "another-user"),
    ).rejects.toThrowError("COMMENT.NOT_AUTHORIZED");

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("should return comments by thread id", async () => {
    // Arrange
    const threadId = "thread-123";

    const expectedComments = [
      {
        id: "comment-123",
        content: "Komentar pertama",
        date: new Date().toISOString(),
        username: "dicoding",
      },
      {
        id: "comment-456",
        content: "Komentar kedua",
        date: new Date().toISOString(),
        username: "user",
      },
    ];

    pool.query.mockResolvedValue({
      rows: expectedComments,
    });

    // Action
    const comments =
      await commentRepositoryPostgres.getCommentsByThreadId(threadId);

    // Assert
    expect(comments).toStrictEqual(expectedComments);

    expect(pool.query).toHaveBeenCalledWith(
      expect.objectContaining({
        values: [threadId],
      }),
    );
  });
});
