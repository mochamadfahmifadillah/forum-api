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
}

export default ThreadRepositoryPostgres;
