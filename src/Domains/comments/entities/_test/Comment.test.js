import { describe, it, expect } from "vitest";
import Comment from "../Comment.js";

describe("Comment entity", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "Sebuah komentar",
      date: new Date().toISOString(),
      username: "dicoding",
      thread_id: "thread-123",
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "Sebuah komentar",
      date: new Date().toISOString(),
      username: "dicoding",
      thread_id: "thread-123",
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should create comment object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "Sebuah komentar",
      date: new Date().toISOString(),
      username: "dicoding",
      thread_id: "thread-123",
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.date).toEqual(payload.date);
    expect(comment.username).toEqual(payload.username);
    expect(comment.threadId).toEqual(payload.thread_id);
  });
});
