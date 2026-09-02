class ToggleCommentLikeUseCase {
  constructor({ commentLikeRepository, commentRepository, threadRepository }) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(username, threadId, commentId) {
    await this._threadRepository.getThreadById(threadId);

    const comments =
      await this._commentRepository.getCommentsByThreadId(threadId);

    const comment = comments.find((item) => item.id === commentId);

    if (!comment) {
      throw new Error("COMMENT.NOT_FOUND");
    }

    return this._commentLikeRepository.toggleLike(username, commentId);
  }
}

export default ToggleCommentLikeUseCase;
