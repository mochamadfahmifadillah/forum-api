import ToggleCommentLikeUseCase from "../ToggleCommentLikeUseCase.js";

describe("ToggleCommentLikeUseCase", () => {
  it("should toggle comment like successfully", async () => {
    const mockCommentLikeRepository = {
      toggleLike: vi.fn().mockResolvedValue(true),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn().mockResolvedValue([
        {
          id: "comment-123",
          username: "dicoding",
          content: "Sebuah komentar",
        },
      ]),
    };

    const mockThreadRepository = {
      getThreadById: vi.fn().mockResolvedValue({
        id: "thread-123",
        title: "Sebuah thread",
        body: "Isi thread",
        username: "dicoding",
      }),
    };

    const useCase = new ToggleCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute(
      "dicoding",
      "thread-123",
      "comment-123",
    );

    expect(result).toEqual(true);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      "thread-123",
    );

    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      "thread-123",
    );

    expect(mockCommentLikeRepository.toggleLike).toHaveBeenCalledWith(
      "dicoding",
      "comment-123",
    );
  });

  it("should throw error when comment does not belong to thread", async () => {
    const mockCommentLikeRepository = {
      toggleLike: vi.fn(),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn().mockResolvedValue([
        {
          id: "comment-other",
          username: "dicoding",
          content: "Komentar lain",
        },
      ]),
    };

    const mockThreadRepository = {
      getThreadById: vi.fn().mockResolvedValue({
        id: "thread-123",
      }),
    };

    const useCase = new ToggleCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(
      useCase.execute("dicoding", "thread-123", "comment-123"),
    ).rejects.toThrow("COMMENT.NOT_FOUND");

    expect(mockCommentLikeRepository.toggleLike).not.toHaveBeenCalled();
  });

  it("should propagate error when thread does not exist", async () => {
    const mockCommentLikeRepository = {
      toggleLike: vi.fn(),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn(),
    };

    const mockThreadRepository = {
      getThreadById: vi.fn().mockRejectedValue(new Error("THREAD.NOT_FOUND")),
    };

    const useCase = new ToggleCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(
      useCase.execute("dicoding", "thread-123", "comment-123"),
    ).rejects.toThrow("THREAD.NOT_FOUND");

    expect(mockCommentRepository.getCommentsByThreadId).not.toHaveBeenCalled();

    expect(mockCommentLikeRepository.toggleLike).not.toHaveBeenCalled();
  });
});
