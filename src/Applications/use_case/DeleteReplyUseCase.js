class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(replyId, owner) {
    return this._replyRepository.deleteReply(
      replyId,
      owner,
    );
  }
}

export default DeleteReplyUseCase;