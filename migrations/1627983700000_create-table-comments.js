export const up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    content: {
      type: 'TEXT',
      notNull: true,
    },

    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    username: {
      type: 'VARCHAR(50)',
      notNull: true,
    },

    'thread_id': {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('comments', 'fk_comments.username_users.username', {
    foreignKeys: {
      columns: 'username',
      references: 'users(username)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('comments', 'fk_comments.thread_id_threads.id', {
    foreignKeys: {
      columns: 'thread_id',
      references: 'threads(id)',
      onDelete: 'CASCADE',
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('comments');
};
