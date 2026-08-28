import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { nanoid } from 'nanoid';

import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import pool from '../../database/postgres/pool.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';

describe('ThreadRepositoryPostgres', () => {
  const threadRepositoryPostgres = new ThreadRepositoryPostgres(
    pool,
    nanoid,
  );

  beforeEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  it('should persist new thread', async () => {
    // Arrange
    const owner = 'user-123';

    const payload = {
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
    };

    // Action
    const addedThread = await threadRepositoryPostgres.addThread(
      owner,
      payload,
    );

    // Assert returned entity
    expect(addedThread).toMatchObject({
      title: payload.title,
      body: payload.body,
      owner,
    });

    expect(addedThread.id).toMatch(/^thread-/);

    // Assert database persistence
    const threads = await ThreadsTableTestHelper.findThreadById(
      addedThread.id,
    );

    expect(threads).toHaveLength(1);

    expect(threads[0]).toMatchObject({
      id: addedThread.id,
      title: payload.title,
      body: payload.body,
      owner,
    });
  });
});
