import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

import ReplyRepositoryPostgres from "../ReplyRepositoryPostgres.js";

describe("ReplyRepositoryPostgres", () => {
  let pool;
  let idGenerator;
  let replyRepositoryPostgres;

  beforeEach(() => {
    pool = {
      query: vi.fn(),
    };

    idGenerator = vi.fn(() => "123");

    replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, idGenerator);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should persist new reply", async () => {
    // Arrange
    const owner = "dicoding";
    const commentId = "comment-123";

    const payload = {
      content: "Sebuah balasan",
    };

    pool.query.mockResolvedValue({
      rows: [
        {
          id: "reply-123",
          content: "Sebuah balasan",
          date: new Date().toISOString(),
          username: "dicoding",
          comment_id: "comment-123",
        },
      ],
    });

    // Action
    const addedReply = await replyRepositoryPostgres.addReply(
      owner,
      commentId,
      payload,
    );

    // Assert
    expect(idGenerator).toHaveBeenCalledTimes(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.objectContaining({
        values: ["reply-123", payload.content, owner, commentId],
      }),
    );

    expect(addedReply).toStrictEqual({
      id: "reply-123",
      content: "Sebuah balasan",
      date: expect.any(String),
      username: owner,
      comment_id: commentId,
    });
  });

  it("should delete reply when owner is correct", async () => {
    // Arrange
    const replyId = "reply-123";
    const owner = "dicoding";

    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: replyId,
            username: owner,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [],
      });

    // Action
    await replyRepositoryPostgres.deleteReply(replyId, owner);

    // Assert
    expect(pool.query).toHaveBeenCalledTimes(2);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        values: [replyId],
      }),
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        values: [replyId],
      }),
    );
  });

  it("should throw error when reply is not found", async () => {
    // Arrange
    const replyId = "reply-123";

    pool.query.mockResolvedValue({
      rows: [],
    });

    // Action & Assert
    await expect(
      replyRepositoryPostgres.deleteReply(replyId, "dicoding"),
    ).rejects.toThrowError("REPLY.NOT_FOUND");

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("should throw error when user is not the reply owner", async () => {
    // Arrange
    const replyId = "reply-123";

    pool.query.mockResolvedValue({
      rows: [
        {
          id: replyId,
          username: "owner",
        },
      ],
    });

    // Action & Assert
    await expect(
      replyRepositoryPostgres.deleteReply(replyId, "another-user"),
    ).rejects.toThrowError("REPLY.NOT_AUTHORIZED");

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("should return replies by comment id", async () => {
    // Arrange
    const commentId = "comment-123";

    const expectedReplies = [
      {
        id: "reply-123",
        content: "Balasan pertama",
        date: new Date().toISOString(),
        username: "dicoding",
      },
      {
        id: "reply-456",
        content: "Balasan kedua",
        date: new Date().toISOString(),
        username: "user",
      },
    ];

    pool.query.mockResolvedValue({
      rows: expectedReplies,
    });

    // Action
    const replies =
      await replyRepositoryPostgres.getRepliesByCommentId(commentId);

    // Assert
    expect(replies).toStrictEqual(expectedReplies);

    expect(pool.query).toHaveBeenCalledWith(
      expect.objectContaining({
        values: [commentId],
      }),
    );
  });
});
