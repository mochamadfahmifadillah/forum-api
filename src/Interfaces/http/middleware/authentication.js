import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authentication = (container) => {
  return async (req, res, next) => {
    try {
      const authenticationTokenManager = container.getInstance(
        AuthenticationTokenManager.name,
      );

      const { authorization } = req.headers;

      if (!authorization) {
        throw new AuthenticationError('Missing authentication');
      }

      const [type, token] = authorization.split(' ');

      if (type !== 'Bearer' || !token) {
        throw new AuthenticationError('Invalid authentication');
      }

      const payload = await authenticationTokenManager.decodePayload(token);

      if (!payload || !payload.id) {
        throw new AuthenticationError('Invalid authentication');
      }

      req.auth = {
        credentials: payload,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authentication;
