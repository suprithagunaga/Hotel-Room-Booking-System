import { ActivityLog } from '../models/ActivityLog.js';

export async function logActivity(event) {
  try { await ActivityLog.create(event); } catch (error) { console.error('Activity log failed:', error.message); }
}
