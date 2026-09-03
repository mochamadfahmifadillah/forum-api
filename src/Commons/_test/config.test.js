import { afterEach, describe, expect, it, vi } from 'vitest';

describe('config', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.resetModules();
  });

  it('should load configuration outside test environment', async () => {
    process.env.NODE_ENV = 'development';

    vi.resetModules();

    const { default: config } = await import('../config.js');

    expect(config.app.host).toEqual('localhost');
    expect(config.app.debug).toEqual({
      request: ['error'],
    });
  });

  it('should use empty debug configuration outside development environment', async () => {
    process.env.NODE_ENV = 'production';

    vi.resetModules();

    const { default: config } = await import('../config.js');

    expect(config.app.host).toEqual('0.0.0.0');
    expect(config.app.debug).toEqual({});
  });
});
