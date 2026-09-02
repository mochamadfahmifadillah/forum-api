import CommentLikeRepository from "../CommentLikeRepository.js";

describe("CommentLikeRepository interface", () => {
  it("should throw error when toggleLike method is not implemented", async () => {
    const repository = new CommentLikeRepository();

    await expect(
      repository.toggleLike("dicoding", "comment-123"),
    ).rejects.toThrow("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });

  it("should throw error when getLikeCountByCommentId method is not implemented", async () => {
    const repository = new CommentLikeRepository();

    await expect(
      repository.getLikeCountByCommentId("comment-123"),
    ).rejects.toThrow("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });

  it("should throw error when isLikedByUser method is not implemented", async () => {
    const repository = new CommentLikeRepository();

    await expect(
      repository.isLikedByUser("dicoding", "comment-123"),
    ).rejects.toThrow("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
