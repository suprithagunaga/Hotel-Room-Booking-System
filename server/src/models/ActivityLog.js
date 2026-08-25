import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  action: { type: String, required: true },
  bookingId: { type: String, default: null },
  roomId: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
