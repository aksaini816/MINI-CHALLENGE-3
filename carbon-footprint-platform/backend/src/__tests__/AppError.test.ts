import { AppError } from '../utils/AppError';

describe('AppError', () => {
  it('creates a 400 bad request error', () => {
    const err = AppError.badRequest('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
    expect(err.isOperational).toBe(true);
  });

  it('creates a 401 unauthorized error', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('creates a 403 forbidden error', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('creates a 404 not found error with resource name', () => {
    const err = AppError.notFound('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
    expect(err.code).toBe('NOT_FOUND');
  });

  it('creates a 409 conflict error', () => {
    const err = AppError.conflict('Email already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('creates a 500 internal error as non-operational', () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });

  it('AppError is instanceof Error', () => {
    const err = AppError.badRequest('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('has a stack trace', () => {
    const err = AppError.badRequest('test');
    expect(err.stack).toBeDefined();
  });
});
