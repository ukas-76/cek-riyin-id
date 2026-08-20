import { pool } from '../db';
import { numberCheckService, UnifiedCheckResult } from './numberCheckService';
import { messageCheckService } from './messageCheckService';
import { linkCheckService } from './linkCheckService';
import { randomUUID } from 'crypto';

export interface CheckRequestParams {
  type: string;
  input: string;
  userId?: string | null;
}

export interface CheckHistoryRecord {
  id: string;
  user_id: string | null;
  type: string;
  input: string;
  risk_level: string;
  result: any;
  created_at: Date;
}

export const inMemoryChecksHistory: CheckHistoryRecord[] = [];

export class CheckService {
  /**
   * Central checking dispatcher with PostgreSQL & In-Memory Fallback History.
   */
  async processCheck(params: CheckRequestParams): Promise<UnifiedCheckResult> {
    const { type, input, userId } = params;

    let result: UnifiedCheckResult;

    if (type === 'number') {
      result = await numberCheckService.checkNumber(input);
    } else if (type === 'message') {
      result = await messageCheckService.checkMessage(input);
    } else if (type === 'link') {
      result = await linkCheckService.checkLink(input);
    } else {
      throw new Error(`Unsupported check type: ${type}`);
    }

    const record: CheckHistoryRecord = {
      id: randomUUID(),
      user_id: userId || null,
      type: result.type,
      input: result.input,
      risk_level: result.riskLevel,
      result: result,
      created_at: new Date()
    };

    inMemoryChecksHistory.unshift(record);

    // Audit log check attempt to PostgreSQL checks table
    try {
      await pool.query(
        'INSERT INTO checks (id, user_id, type, input, risk_level, result, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [record.id, record.user_id, record.type, record.input, record.risk_level, JSON.stringify(result)]
      );
    } catch (err: any) {
      console.warn('[CheckService] DB insert check log skipped:', err.message);
    }

    return result;
  }
}

export const checkService = new CheckService();
