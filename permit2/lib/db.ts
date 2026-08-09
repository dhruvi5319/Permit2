import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
}

// Lazy singleton — only instantiated on first access
let _prisma: PrismaClient | undefined = global.__prisma;

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      _prisma = createPrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        global.__prisma = _prisma;
      }
    }
    const value = (_prisma as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
    if (typeof value === 'function') {
      return value.bind(_prisma);
    }
    return value;
  },
});
