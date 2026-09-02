import AddReplyUseCase from "../../../../Applications/use_case/AddReplyUseCase.js";

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
  }

  async postReplyHandler(req, res, next) {
    try {
      const { username } = req.auth.credentials;
      const { threadId, commentId } = req.params;

      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

      const addedReply = await addReplyUseCase.execute(
        username,
        threadId,
        commentId,
        req.body,
      );

      return res.status(201).json({
        status: "success",
        data: {
          addedReply: {
            id: addedReply.id,
            content: addedReply.content,
            owner: addedReply.username,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default RepliesHandler;
