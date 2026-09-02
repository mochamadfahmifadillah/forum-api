import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';

const threads = (container, authenticationMiddleware) => {
  const handler = new ThreadsHandler(container);

  return createThreadsRouter(handler, authenticationMiddleware);
};

export default threads;