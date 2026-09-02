import CommentLikeRepository from "../../Domains/comments/CommentLikeRepository.js";

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool) {
    super();

    this._pool = pool;
  }

  async toggleLike(username, commentId) {
    const checkQuery = {
      text: `
        SELECT 1
        FROM comment_likes
        WHERE username = $1 AND comment_id = $2
      `,
      values: [username, commentId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      const deleteQuery = {
        text: `
          DELETE FROM comment_likes
          WHERE username = $1 AND comment_id = $2
        `,
        values: [username, commentId],
      };

      await this._pool.query(deleteQuery);

      return false;
    }

    const insertQuery = {
      text: `
        INSERT INTO comment_likes
        (username, comment_id)
        VALUES ($1, $2)
      `,
      values: [username, commentId],
    };

    await this._pool.query(insertQuery);

    return true;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: `
        SELECT COUNT(*)::int AS count
        FROM comment_likes
        WHERE comment_id = $1
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].count;
  }

  async isLikedByUser(username, commentId) {
    const query = {
      text: `
        SELECT 1
        FROM comment_likes
        WHERE username = $1 AND comment_id = $2
      `,
      values: [username, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.length > 0;
  }
}

export default CommentLikeRepositoryPostgres;
