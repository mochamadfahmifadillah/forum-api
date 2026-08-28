import express from 'express';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';

import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';

import authentication from '../../Interfaces/http/middleware/authentication.js';

const createServer = async (container) => {
  const app = express();

  // Middleware
  app.use(express.json());

  const authenticationMiddleware = authentication(container);

  // Routes
  app.use('/users', users(container));

  app.use('/authentications', authentications(container));

  app.use(
    '/threads',
    threads(container, authenticationMiddleware),
  );

  // Global Error Handler
  app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });

  return app;
};

export default createServer;
