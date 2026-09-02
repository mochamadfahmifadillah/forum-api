import { describe, it, expect } from "vitest";
import CommentRepository from "../CommentRepository.js";

describe("CommentRepository", () => {
  it("should throw error when addComment method is called", async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(commentRepository.addComment()).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });

  it("should throw error when deleteComment method is called", async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(commentRepository.deleteComment()).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });

  it("should throw error when getCommentsByThreadId method is called", async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(
      commentRepository.getCommentsByThreadId("thread-123"),
    ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
