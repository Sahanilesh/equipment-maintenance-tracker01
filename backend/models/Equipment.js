import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'broken'],
    default: 'operational'
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Equipment', equipmentSchema);