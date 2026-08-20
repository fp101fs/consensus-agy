import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function initDbSchema() {
  const db = getDbPool();
  
  // Table for tracking each full consensus run with benchmark IDs
  await db.query(`
    CREATE TABLE IF NOT EXISTS consensus_queries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      benchmark_id TEXT,
      benchmark_title TEXT,
      prompt TEXT NOT NULL,
      winner_model_id TEXT,
      winner_reason TEXT,
      agreement_level TEXT,
      agreement_score NUMERIC,
      confidence_rating NUMERIC,
      total_cost_usd NUMERIC DEFAULT 0,
      total_tokens_in INTEGER DEFAULT 0,
      total_tokens_out INTEGER DEFAULT 0,
      total_latency_ms INTEGER DEFAULT 0,
      judge_report JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Ensure column exists if table was previously created without it
  await db.query(`
    ALTER TABLE consensus_queries ADD COLUMN IF NOT EXISTS benchmark_id TEXT;
    ALTER TABLE consensus_queries ADD COLUMN IF NOT EXISTS benchmark_title TEXT;
  `);

  // Table for tracking individual model executions inside each consensus run
  await db.query(`
    CREATE TABLE IF NOT EXISTS model_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      query_id UUID REFERENCES consensus_queries(id) ON DELETE CASCADE,
      benchmark_id TEXT,
      model_id TEXT NOT NULL,
      model_name TEXT NOT NULL,
      provider TEXT,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost_usd NUMERIC DEFAULT 0,
      latency_ms INTEGER DEFAULT 0,
      tokens_per_sec NUMERIC DEFAULT 0,
      response_text TEXT,
      is_winner BOOLEAN DEFAULT FALSE,
      accuracy_score NUMERIC,
      completeness_score NUMERIC,
      reasoning_score NUMERIC,
      overall_score NUMERIC,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await db.query(`
    ALTER TABLE model_runs ADD COLUMN IF NOT EXISTS benchmark_id TEXT;
  `);

  // Create indexes for fast query history, benchmark aggregation and rankings analytics
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_consensus_queries_created_at ON consensus_queries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_consensus_queries_benchmark ON consensus_queries(benchmark_id);
    CREATE INDEX IF NOT EXISTS idx_model_runs_model_id ON model_runs(model_id);
    CREATE INDEX IF NOT EXISTS idx_model_runs_query_id ON model_runs(query_id);
    CREATE INDEX IF NOT EXISTS idx_model_runs_benchmark ON model_runs(benchmark_id);
  `);
}
