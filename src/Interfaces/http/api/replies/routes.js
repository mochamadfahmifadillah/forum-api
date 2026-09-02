import express from "express";

const createRepliesRouter = (handler, authenticationMiddleware) => {
  const router = express.Router({ mergeParams: true });

  router.post("/", authenticationMiddleware, handler.postReplyHandler);

  return router;
};

export default createRepliesRouter;
