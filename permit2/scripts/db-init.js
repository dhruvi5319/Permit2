#!/usr/bin/env node
/**
 * db-init.js — Apply the initial DB schema via raw SQL using pg.
 * Used instead of `prisma migrate deploy` in environments where the
 * Prisma schema-engine binary cannot be downloaded (no network at runtime).
 */
'use strict';

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIGRATION_NAME = '0001_init';
const MIGRATION_SQL_PATH = path.join(__dirname, '../prisma/migrations/0001_init/migration.sql');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Ensure the Prisma migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id                      VARCHAR(36) PRIMARY KEY NOT NULL,
        checksum                VARCHAR(64) NOT NULL,
        finished_at             TIMESTAMPTZ,
        migration_name          TEXT NOT NULL,
        logs                    TEXT,
        rolled_back_at          TIMESTAMPTZ,
        started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        applied_steps_count     INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Check if this migration was already applied
    const existing = await client.query(
      'SELECT id FROM "_prisma_migrations" WHERE migration_name = $1',
      [MIGRATION_NAME]
    );

    if (existing.rows.length > 0) {
      console.log(`Migration "${MIGRATION_NAME}" already applied. Skipping.`);
      return;
    }

    // Read and apply the SQL
    const sql = fs.readFileSync(MIGRATION_SQL_PATH, 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');
    const id = crypto.randomUUID();

    console.log(`Applying migration "${MIGRATION_NAME}"...`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)`,
        [id, checksum, MIGRATION_NAME]
      );
      await client.query('COMMIT');
      console.log(`Migration "${MIGRATION_NAME}" applied successfully.`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('db-init failed:', err.message);
  process.exit(1);
});
