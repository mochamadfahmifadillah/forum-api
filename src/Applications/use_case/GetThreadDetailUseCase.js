class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);

    const comments =
      await this._commentRepository.getCommentsByThreadId(threadId);

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const [replies, likeCount] = await Promise.all([
          this._replyRepository.getRepliesByCommentId(comment.id),
          this._commentLikeRepository.getLikeCountByCommentId(comment.id),
        ]);

        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          likeCount,
          replies,
        };
      }),
    );

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: commentsWithReplies,
    };
  }
}

export default GetThreadDetailUseCase;
