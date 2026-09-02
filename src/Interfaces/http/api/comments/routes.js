import express from "express";

const createCommentsRouter = (handler, authenticationMiddleware) => {
  const router = express.Router({ mergeParams: true });

  // Add Comment
  router.post("/", authenticationMiddleware, handler.postCommentHandler);

  // Delete Comment
  router.delete(
    "/:commentId",
    authenticationMiddleware,
    handler.deleteCommentHandler,
  );

  // Delete Reply
  router.delete(
    "/:commentId/replies/:replyId",
    authenticationMiddleware,
    handler.deleteReplyHandler,
  );

  // Like / Unlike Comment
  router.put(
    "/:commentId/likes",
    authenticationMiddleware,
    handler.putCommentLikeHandler,
  );

  return router;
};

export default createCommentsRouter;
