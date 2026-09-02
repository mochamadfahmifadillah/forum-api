export const up = (pgm) => {
  pgm.createTable("comment_likes", {
    username: {
      type: "VARCHAR(50)",
      notNull: true,
    },

    comment_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint("comment_likes", "pk_comment_likes", {
    primaryKey: ["username", "comment_id"],
  });

  pgm.addConstraint(
    "comment_likes",
    "fk_comment_likes.username_users.username",
    {
      foreignKeys: {
        columns: "username",
        references: "users(username)",
        onDelete: "CASCADE",
      },
    },
  );

  pgm.addConstraint(
    "comment_likes",
    "fk_comment_likes.comment_id_comments.id",
    {
      foreignKeys: {
        columns: "comment_id",
        references: "comments(id)",
        onDelete: "CASCADE",
      },
    },
  );
};

export const down = (pgm) => {
  pgm.dropTable("comment_likes");
};
