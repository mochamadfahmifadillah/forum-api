class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, username, useCasePayload) {
    const { content } = useCasePayload || {};

    if (!content) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    await this._threadRepository.getThreadById(threadId);

    return this._commentRepository.addComment(
      threadId,
      username,
      useCasePayload,
    );
  }
}

export default AddCommentUseCase;
