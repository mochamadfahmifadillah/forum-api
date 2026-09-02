import { describe, it, expect, vi } from "vitest";
import GetThreadDetailUseCase from "../GetThreadDetailUseCase.js";

describe("GetThreadDetailUseCase", () => {
  it("should orchestrate the get thread detail action correctly", async () => {
    // Arrange
    const threadId = "thread-123";

    const expectedThread = {
      id: "thread-123",
      title: "Sebuah thread",
      body: "Sebuah body thread",
      date: new Date().toISOString(),
      username: "dicoding",
    };

    const comments = [
      {
        id: "comment-123",
        username: "user1",
        date: new Date().toISOString(),
        content: "Sebuah komentar",
      },
      {
        id: "comment-456",
        username: "user2",
        date: new Date().toISOString(),
        content: "Komentar lainnya",
      },
    ];

    const repliesComment123 = [
      {
        id: "reply-123",
        username: "user2",
        date: new Date().toISOString(),
        content: "Sebuah balasan",
      },
    ];

    const repliesComment456 = [
      {
        id: "reply-456",
        username: "user1",
        date: new Date().toISOString(),
        content: "Balasan lainnya",
      },
    ];

    const threadRepository = {
      getThreadById: vi.fn(() => Promise.resolve(expectedThread)),
    };

    const commentRepository = {
      getCommentsByThreadId: vi.fn(() => Promise.resolve(comments)),
    };

    const replyRepository = {
      getRepliesByCommentId: vi.fn((commentId) => {
        if (commentId === "comment-123") {
          return Promise.resolve(repliesComment123);
        }

        return Promise.resolve(repliesComment456);
      }),
    };

    const commentLikeRepository = {
      getLikeCountByCommentId: vi.fn((commentId) => {
        if (commentId === "comment-123") {
          return Promise.resolve(3);
        }

        return Promise.resolve(5);
      }),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
      commentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual({
      id: expectedThread.id,
      title: expectedThread.title,
      body: expectedThread.body,
      date: expectedThread.date,
      username: expectedThread.username,
      comments: [
        {
          id: comments[0].id,
          username: comments[0].username,
          date: comments[0].date,
          content: comments[0].content,
          likeCount: 3,
          replies: repliesComment123,
        },
        {
          id: comments[1].id,
          username: comments[1].username,
          date: comments[1].date,
          content: comments[1].content,
          likeCount: 5,
          replies: repliesComment456,
        },
      ],
    });

    expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);

    expect(commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );

    expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      "comment-123",
    );

    expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      "comment-456",
    );

    expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(2);

    expect(commentLikeRepository.getLikeCountByCommentId).toHaveBeenCalledWith(
      "comment-123",
    );

    expect(commentLikeRepository.getLikeCountByCommentId).toHaveBeenCalledWith(
      "comment-456",
    );

    expect(commentLikeRepository.getLikeCountByCommentId).toHaveBeenCalledTimes(
      2,
    );
  });

  it("should return thread detail with empty comments", async () => {
    // Arrange
    const threadId = "thread-123";

    const threadRepository = {
      getThreadById: vi.fn(() =>
        Promise.resolve({
          id: "thread-123",
          title: "Sebuah thread",
          body: "Sebuah body thread",
          date: new Date().toISOString(),
          username: "dicoding",
        }),
      ),
    };

    const commentRepository = {
      getCommentsByThreadId: vi.fn(() => Promise.resolve([])),
    };

    const replyRepository = {
      getRepliesByCommentId: vi.fn(),
    };

    const commentLikeRepository = {
      getLikeCountByCommentId: vi.fn(),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
      commentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.comments).toEqual([]);

    expect(replyRepository.getRepliesByCommentId).not.toHaveBeenCalled();

    expect(
      commentLikeRepository.getLikeCountByCommentId,
    ).not.toHaveBeenCalled();
  });
});
