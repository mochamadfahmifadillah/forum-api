import { describe, it, expect, vi } from "vitest";
import DeleteReplyUseCase from "../DeleteReplyUseCase.js";

describe("DeleteReplyUseCase", () => {
  it("should orchestrate the delete reply action correctly", async () => {
    // Arrange
    const replyId = "reply-123";
    const owner = "dicoding";

    const replyRepository = {
      deleteReply: vi.fn(() => Promise.resolve()),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(replyId, owner);

    // Assert
    expect(replyRepository.deleteReply).toHaveBeenCalledWith(replyId, owner);

    expect(replyRepository.deleteReply).toHaveBeenCalledTimes(1);
  });
});
