export const up = (pgm) => {
  pgm.createTable('replies', {
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

    'comment_id': {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('replies', 'fk_replies.username_users.username', {
    foreignKeys: {
      columns: 'username',
      references: 'users(username)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('replies', 'fk_replies.comment_id_comments.id', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('replies');
};