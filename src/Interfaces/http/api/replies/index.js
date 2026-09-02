import RepliesHandler from "./handler.js";
import createRepliesRouter from "./routes.js";

const replies = (container, authenticationMiddleware) => {
  const handler = new RepliesHandler(container);

  return createRepliesRouter(handler, authenticationMiddleware);
};

export default replies;
