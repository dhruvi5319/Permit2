export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class InvalidTransitionError extends AppError {
  constructor(current: string, action: string) {
    super(
      'INVALID_TRANSITION',
      `Cannot perform '${action}' on a permit with status '${current}'.`,
      400
    );
    this.name = 'InvalidTransitionError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Permit') {
    super('PERMIT_NOT_FOUND', `${resource} not found.`, 404);
    this.name = 'NotFoundError';
  }
}
