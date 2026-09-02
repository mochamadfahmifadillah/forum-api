import AddCommentUseCase from "../../../../Applications/use_case/AddCommentUseCase.js";
import DeleteCommentUseCase from "../../../../Applications/use_case/DeleteCommentUseCase.js";
import DeleteReplyUseCase from "../../../../Applications/use_case/DeleteReplyUseCase.js";
import ToggleCommentLikeUseCase from "../../../../Applications/use_case/ToggleCommentLikeUseCase.js";

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const { username } = req.auth.credentials;

      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );

      const addedComment = await addCommentUseCase.execute(
        req.params.threadId,
        username,
        req.body,
      );

      res.status(201).json({
        status: "success",
        data: {
          addedComment: {
            id: addedComment.id,
            content: addedComment.content,
            owner: addedComment.username,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { username } = req.auth.credentials;

      const deleteCommentUseCase = this._container.getInstance(
        DeleteCommentUseCase.name,
      );

      await deleteCommentUseCase.execute(req.params.commentId, username);

      res.status(200).json({
        status: "success",
        message: "komentar berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
    try {
      const { username } = req.auth.credentials;

      const deleteReplyUseCase = this._container.getInstance(
        DeleteReplyUseCase.name,
      );

      await deleteReplyUseCase.execute(req.params.replyId, username);

      res.status(200).json({
        status: "success",
        message: "balasan berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  async putCommentLikeHandler(req, res, next) {
    try {
      const { username } = req.auth.credentials;
      const { threadId, commentId } = req.params;

      const toggleCommentLikeUseCase = this._container.getInstance(
        ToggleCommentLikeUseCase.name,
      );

      await toggleCommentLikeUseCase.execute(username, threadId, commentId);

      return res.status(200).json({
        status: "success",
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default CommentsHandler;
