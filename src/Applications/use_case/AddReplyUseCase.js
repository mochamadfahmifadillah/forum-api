class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, threadId, commentId, useCasePayload) {
    const { content } = useCasePayload || {};

    if (!content) {
      throw new Error("REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof content !== "string") {
      throw new Error("REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }

    await this._threadRepository.getThreadById(threadId);

    const comments =
      await this._commentRepository.getCommentsByThreadId(threadId);

    const comment = comments.find((item) => item.id === commentId);

    if (!comment) {
      throw new Error("COMMENT.NOT_FOUND");
    }

    return this._replyRepository.addReply(owner, commentId, useCasePayload);
  }
}

export default AddReplyUseCase;
