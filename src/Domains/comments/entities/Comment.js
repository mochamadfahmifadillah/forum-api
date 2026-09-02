class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, date, username, thread_id: threadId } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.threadId = threadId;
  }

  _verifyPayload({ id, content, date, username, thread_id: threadId }) {
    if (!id || !content || !date || !username || !threadId) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      !(date instanceof Date || typeof date === 'string') ||
      typeof username !== 'string' ||
      typeof threadId !== 'string'
    ) {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default Comment;
