import { describe, it, expect, vi } from "vitest";
import DeleteCommentUseCase from "../DeleteCommentUseCase.js";

describe("DeleteCommentUseCase", () => {
  it("should orchestrate the delete comment action correctly", async () => {
    // Arrange
    const commentId = "comment-123";
    const username = "dicoding";

    const commentRepository = {
      deleteComment: vi.fn(() => Promise.resolve()),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(commentId, username);

    // Assert
    expect(commentRepository.deleteComment).toHaveBeenCalledWith(
      commentId,
      username,
    );

    expect(commentRepository.deleteComment).toHaveBeenCalledTimes(1);
  });
});
