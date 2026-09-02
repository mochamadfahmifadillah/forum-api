import { describe, it, expect } from "vitest";
import ReplyRepository from "../ReplyRepository.js";

describe("ReplyRepository", () => {
  it("should throw error when addReply method is called", async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(replyRepository.addReply()).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });

  it("should throw error when deleteReply method is called", async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(replyRepository.deleteReply()).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });

  it("should throw error when getRepliesByCommentId method is called", async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(replyRepository.getRepliesByCommentId()).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });
});
