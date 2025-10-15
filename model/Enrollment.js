const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paid: {
    type: Boolean,
    default: false
  },
  // Remove these redundant fields - get from User model instead
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Prevent duplicate pending/approved enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Safe model definition
module.exports = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);