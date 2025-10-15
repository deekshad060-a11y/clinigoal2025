const Course = require("../model/course");
const Assignment = require("../model/Assignment");
const Quiz = require("../model/Quiz");
const User = require("../model/user");

exports.calculateCourseProgress = async (userId) => {
  try {
    const user = await User.findById(userId).populate("enrolledCourses");
    if (!user) throw new Error("User not found");

    const updatedCourseProgress = [];

    for (const course of user.enrolledCourses) {
      // Get all assignments and quizzes for this course
      const assignments = await Assignment.find({ courseId: course._id });
      const quizzes = await Quiz.find({ courseId: course._id });

      // ✅ Count how many assignments the student has submitted
      const completedAssignments = assignments.filter(a =>
        a.submissions.some(s => s.studentId.toString() === userId)
      ).length;

      // ✅ Count how many quizzes the student has submitted
      const completedQuizzes = quizzes.filter(q =>
        q.submissions.some(s => s.studentId.toString() === userId)
      ).length;

      const totalAssignments = assignments.length;
      const totalQuizzes = quizzes.length;

      // ✅ Compute percentage progress for assignments & quizzes
      const assignmentProgress = totalAssignments
        ? (completedAssignments / totalAssignments) * 100
        : 0;
      const quizProgress = totalQuizzes
        ? (completedQuizzes / totalQuizzes) * 100
        : 0;

      // ✅ Average both to get total course progress
      const overallProgress = Math.round((assignmentProgress + quizProgress) / 2);

      // ✅ Store result
      updatedCourseProgress.push({
        courseId: course._id,
        totalAssignments,
        totalQuizzes,
        completedAssignments,
        completedQuizzes,
        assignmentProgress: Math.round(assignmentProgress),
        quizProgress: Math.round(quizProgress),
        overallProgress,
        updatedAt: new Date(),
      });
    }

    // ✅ Save progress in the user's document
    user.courseProgress = updatedCourseProgress;
    await user.save();

    return updatedCourseProgress;

  } catch (err) {
    console.error("Error calculating progress:", err);
    throw err;
  }
};
