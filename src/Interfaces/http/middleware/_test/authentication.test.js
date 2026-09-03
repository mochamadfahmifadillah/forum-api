import { describe, it, expect, vi } from 'vitest';
import authentication from '../authentication.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

describe('authentication middleware', () => {
  const createContainer = (decodePayload) => ({
    getInstance: vi.fn(() => ({
      decodePayload: vi.fn(decodePayload),
    })),
  });

  const createRequest = (authorization) => ({
    headers: {
      ...(authorization !== undefined && { authorization }),
    },
  });

  const createResponse = () => ({});

  it('should call next with error when authorization is missing', async () => {
    const container = createContainer();
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    const middleware = authentication(container);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe('Missing authentication');
  });

  it('should call next with error when authorization type is invalid', async () => {
    const container = createContainer(() =>
      Promise.resolve({ id: 'user-123' }),
    );

    const req = createRequest('Basic token-123');
    const res = createResponse();
    const next = vi.fn();

    const middleware = authentication(container);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe('Invalid authentication');
  });

  it('should call next with error when bearer token is missing', async () => {
    const container = createContainer(() =>
      Promise.resolve({ id: 'user-123' }),
    );

    const req = createRequest('Bearer');
    const res = createResponse();
    const next = vi.fn();

    const middleware = authentication(container);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe('Invalid authentication');
  });

  it('should call next with error when decoded payload is invalid', async () => {
    const container = createContainer(() => Promise.resolve(null));

    const req = createRequest('Bearer token-123');
    const res = createResponse();
    const next = vi.fn();

    const middleware = authentication(container);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe('Invalid authentication');
  });

  it('should call next with error when decoded payload does not contain id', async () => {
    const container = createContainer(() =>
      Promise.resolve({ username: 'dicoding' }),
    );

    const req = createRequest('Bearer token-123');
    const res = createResponse();
    const next = vi.fn();

    const middleware = authentication(container);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe('Invalid authentication');
  });

  it('should set authentication credentials and call next when token is valid', async () => {
    const payload = {
      id: 'user-123',
      username: 'dicoding',
    };

    const decodePayload = vi.fn(() => Promise.resolve(payload));

    const container = {
      getInstance: vi.fn(() => ({
        decodePayload,
      })),
    };

    const req = createRequest('Bearer token-123');
    const res = createResponse();
    const next = vi.fn();

    const middleware = authentication(container);

    await middleware(req, res, next);

    expect(container.getInstance).toHaveBeenCalledWith(
      AuthenticationTokenManager.name,
    );

    expect(decodePayload).toHaveBeenCalledWith('token-123');

    expect(req.auth).toStrictEqual({
      credentials: payload,
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
