import CommentRepository from '../../Domains/comments/CommentRepository.js';
import Comment from '../../Domains/comments/entities/Comment.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(threadId, username, { content }) {
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO comments
        (id, content, username, thread_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, date, username, thread_id
      `,
      values: [id, content, username, threadId],
    };

    const result = await this._pool.query(query);

    return new Comment(result.rows[0]);
  }

  async deleteComment(commentId, owner) {
    const findQuery = {
      text: `
      SELECT id, username
      FROM comments
      WHERE id = $1
    `,
      values: [commentId],
    };

    const findResult = await this._pool.query(findQuery);

    // Comment tidak ditemukan
    if (!findResult.rows.length) {
      throw new Error('COMMENT.NOT_FOUND');
    }

    // Comment ada, tapi bukan milik user
    if (findResult.rows[0].username !== owner) {
      throw new Error('COMMENT.NOT_AUTHORIZED');
    }

    // Soft delete
    const updateQuery = {
      text: `
      UPDATE comments
      SET content = '**komentar telah dihapus**'
      WHERE id = $1
    `,
      values: [commentId],
    };

    await this._pool.query(updateQuery);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
      SELECT
        id,
        content,
        date,
        username
      FROM comments
      WHERE thread_id = $1
      ORDER BY date ASC
    `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

export default CommentRepositoryPostgres;
