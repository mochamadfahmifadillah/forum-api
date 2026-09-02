class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(commentId, username) {
    await this._commentRepository.deleteComment(commentId, username);
  }
}

export default DeleteCommentUseCase;
