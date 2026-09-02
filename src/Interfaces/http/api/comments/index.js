import CommentsHandler from './handler.js';
import createCommentsRouter from './routes.js';

const comments = (container, authenticationMiddleware) => {
  const handler = new CommentsHandler(container);

  return createCommentsRouter(handler, authenticationMiddleware);
};

export default comments;
