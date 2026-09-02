import pool from "../../database/postgres/pool.js";
import CommentLikeRepositoryPostgres from "../CommentLikeRepositoryPostgres.js";

describe("CommentLikeRepositoryPostgres", () => {
  const repository = new CommentLikeRepositoryPostgres(pool);

  const userId = "user-like-test";
  const username = "dicoding";
  const threadId = "thread-like-test";
  const commentId = "comment-like-test";

  beforeEach(async () => {
    await pool.query(
      "DELETE FROM comment_likes WHERE username = $1 OR comment_id = $2",
      [username, commentId],
    );

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    await pool.query("DELETE FROM threads WHERE id = $1", [threadId]);

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    await pool.query(
      `
        INSERT INTO users
        (id, username, password, fullname)
        VALUES ($1, $2, $3, $4)
      `,
      [userId, username, "password", "Dicoding Indonesia"],
    );

    await pool.query(
      `
        INSERT INTO threads
        (id, title, body, owner)
        VALUES ($1, $2, $3, $4)
      `,
      [threadId, "Thread Like Test", "Body Like Test", userId],
    );

    await pool.query(
      `
        INSERT INTO comments
        (id, content, username, thread_id)
        VALUES ($1, $2, $3, $4)
      `,
      [commentId, "Comment Like Test", username, threadId],
    );
  });

  afterEach(async () => {
    await pool.query(
      "DELETE FROM comment_likes WHERE username = $1 OR comment_id = $2",
      [username, commentId],
    );

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    await pool.query("DELETE FROM threads WHERE id = $1", [threadId]);

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  });

  describe("toggleLike", () => {
    it("should add like when user has not liked the comment", async () => {
      const result = await repository.toggleLike(username, commentId);

      expect(result).toEqual(true);

      const { rows } = await pool.query(
        `
          SELECT *
          FROM comment_likes
          WHERE username = $1 AND comment_id = $2
        `,
        [username, commentId],
      );

      expect(rows).toHaveLength(1);

      expect(rows[0]).toMatchObject({
        username,
        comment_id: commentId,
      });
    });

    it("should remove like when user has already liked the comment", async () => {
      await pool.query(
        `
          INSERT INTO comment_likes
          (username, comment_id)
          VALUES ($1, $2)
        `,
        [username, commentId],
      );

      const result = await repository.toggleLike(username, commentId);

      expect(result).toEqual(false);

      const { rows } = await pool.query(
        `
          SELECT *
          FROM comment_likes
          WHERE username = $1 AND comment_id = $2
        `,
        [username, commentId],
      );

      expect(rows).toHaveLength(0);
    });
  });

  describe("getLikeCountByCommentId", () => {
    it("should return correct like count", async () => {
      await pool.query(
        `
          INSERT INTO comment_likes
          (username, comment_id)
          VALUES ($1, $2)
        `,
        [username, commentId],
      );

      const result = await repository.getLikeCountByCommentId(commentId);

      expect(result).toEqual(1);
    });

    it("should return zero when comment has no likes", async () => {
      const result = await repository.getLikeCountByCommentId(commentId);

      expect(result).toEqual(0);
    });
  });

  describe("isLikedByUser", () => {
    it("should return true when user has liked the comment", async () => {
      await pool.query(
        `
          INSERT INTO comment_likes
          (username, comment_id)
          VALUES ($1, $2)
        `,
        [username, commentId],
      );

      const result = await repository.isLikedByUser(username, commentId);

      expect(result).toEqual(true);
    });

    it("should return false when user has not liked the comment", async () => {
      const result = await repository.isLikedByUser(username, commentId);

      expect(result).toEqual(false);
    });
  });
});
