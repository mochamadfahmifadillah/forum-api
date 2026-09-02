import ReplyRepository from '../../Domains/comments/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(owner, commentId, { content }) {
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO replies
        (id, content, username, comment_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, date, username, comment_id
      `,
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async deleteReply(replyId, owner) {
    // ==========================================================
    // Cek apakah reply ada
    // ==========================================================

    const findQuery = {
      text: `
        SELECT id, username
        FROM replies
        WHERE id = $1
      `,
      values: [replyId],
    };

    const findResult = await this._pool.query(findQuery);

    // Reply tidak ditemukan
    if (!findResult.rows.length) {
      throw new Error('REPLY.NOT_FOUND');
    }

    // ==========================================================
    // Cek ownership
    // ==========================================================

    if (findResult.rows[0].username !== owner) {
      throw new Error('REPLY.NOT_AUTHORIZED');
    }

    // ==========================================================
    // Soft delete
    // ==========================================================

    const updateQuery = {
      text: `
        UPDATE replies
        SET content = '**balasan telah dihapus**'
        WHERE id = $1
      `,
      values: [replyId],
    };

    await this._pool.query(updateQuery);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT
          id,
          content,
          date,
          username
        FROM replies
        WHERE comment_id = $1
        ORDER BY date ASC
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

export default ReplyRepositoryPostgres;