import ThreadRepository from '../../Domains/threads/ThreadRepository.js';
import Thread from '../../Domains/threads/entities/Thread.js';

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(owner, { title, body }) {
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO threads
        (id, title, body, owner)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, body, date, owner
      `,
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new Thread(result.rows[0]);
  }

  async getThreads() {
    const query = {
      text: `
        SELECT
          threads.id,
          threads.title,
          threads.body,
          threads.date,
          threads.owner,
          users.username
        FROM threads
        INNER JOIN users ON threads.owner = users.id
        ORDER BY threads.date ASC
      `,
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getThreadById(threadId) {
    const query = {
      text: `
      SELECT
        threads.id,
        threads.title,
        threads.body,
        threads.date,
        threads.owner,
        users.username
      FROM threads
      INNER JOIN users ON threads.owner = users.id
      WHERE threads.id = $1
    `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('THREAD.NOT_FOUND');
    }

    return result.rows[0];
  }
}

export default ThreadRepositoryPostgres;
