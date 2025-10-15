const express = require('express');
const router = express.Router();
const Enrollment = require('../model/Enrollment');
const Course = require('../model/course');
const User = require('../model/user');
const authMiddleware = require('../middleware/auth'); // ADD THIS

// Apply auth middleware to all routes
router.use(authMiddleware);

// Student enrolls in a course (pending approval)
router.post('/enroll/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id; // From auth middleware

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You have already enrolled or have a pending enrollment for this course'
      });
    }

    // Create new enrollment with pending status
    const enrollment = new Enrollment({
      studentId,
      courseId,
      status: 'pending'
    });

    await enrollment.save();

    // Populate the response
    await enrollment.populate('courseId', 'title description image duration fees');
    await enrollment.populate('studentId', 'name email phone');

    res.json({
      success: true,
      message: 'Enrollment request submitted. Waiting for admin approval.',
      enrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Enrollment failed',
      error: error.message
    });
  }
});

// Get pending enrollments for student
router.get('/student/enrollments/pending', async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const pendingEnrollments = await Enrollment.find({
      studentId,
      status: 'pending'
    }).populate('courseId', 'title description image duration fees');

    res.json({
      success: true,
      enrollments: pendingEnrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending enrollments',
      error: error.message
    });
  }
});

// Get all enrollments for student
router.get('/student/enrollments', async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const enrollments = await Enrollment.find({ studentId })
      .populate('courseId', 'title description image duration fees category instructor')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
});

// Admin: Get all pending enrollments
router.get('/admin/enrollments/pending', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const pendingEnrollments = await Enrollment.find({ status: 'pending' })
      .populate('courseId', 'title description image duration fees category')
      .populate('studentId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      enrollments: pendingEnrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending enrollments',
      error: error.message
    });
  }
});

// Admin: Approve enrollment
router.put('/admin/enrollments/:enrollmentId/approve', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('courseId')
      .populate('studentId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update enrollment status
    enrollment.status = 'approved';
    enrollment.approvedAt = new Date();
    await enrollment.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(
      enrollment.studentId._id,
      { $addToSet: { enrolledCourses: enrollment.courseId._id } }
    );

    res.json({
      success: true,
      message: 'Enrollment approved successfully',
      enrollment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving enrollment',
      error: error.message
    });
  }
});

// Admin: Reject enrollment
router.put('/admin/enrollments/:enrollmentId/reject', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { enrollmentId } = req.params;
    const { reason } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    enrollment.status = 'rejected';
    enrollment.rejectionReason = reason;
    await enrollment.save();

    res.json({
      success: true,
      message: 'Enrollment rejected successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting enrollment',
      error: error.message
    });
  }
});

module.exports = router;
