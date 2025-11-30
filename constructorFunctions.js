// Assignment Constructor Function
function Assignment(assignmentName) {
  this.assignmentName = assignmentName;
  this.status = 'released';
  this._grade = null; // Private grade property
}

Assignment.prototype.setGrade = function(grade) {
  this._grade = grade;
  if (grade > 50) {
    this.status = 'pass';
  } else {
    this.status = 'fail';
  }
};

Assignment.prototype.getGrade = function() {
  return this._grade;
};

// Observer Constructor Function
function Observer() {}

Observer.prototype.notify = function(studentName, assignmentName, status) {
  // Format status messages appropriately
  let message = '';
  
  if (status === 'released') {
    message = `Observer → ${studentName}, ${assignmentName} has been released.`;
  } else if (status === 'working') {
    message = `Observer → ${studentName} is working on ${assignmentName}.`;
  } else if (status === 'submitted') {
    message = `Observer → ${studentName} has submitted ${assignmentName}.`;
  } else if (status === 'pass') {
    message = `Observer → ${studentName} has passed ${assignmentName}`;
  } else if (status === 'fail') {
    message = `Observer → ${studentName} has failed ${assignmentName}`;
  } else if (status === 'final reminder') {
    message = `Observer → ${studentName}, final reminder for ${assignmentName}.`;
  }
  
  console.log(message);
};

// Student Constructor Function
function Student(fullName, email, observer) {
  this.fullName = fullName;
  this.email = email;
  this.assignmentStatuses = [];
  this.observer = observer;
  this._workingTimeouts = {}; // Track working timeouts for early submission
}

Student.prototype.setFullName = function(name) {
  this.fullName = name;
};

Student.prototype.setEmail = function(email) {
  this.email = email;
};

Student.prototype.updateAssignmentStatus = function(assignmentName, grade = null) {
  let assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
  
  if (!assignment) {
    // Assignment doesn't exist, add it with status 'released'
    assignment = new Assignment(assignmentName);
    this.assignmentStatuses.push(assignment);
    this.observer.notify(this.fullName, assignmentName, 'released');
  } else if (grade !== null) {
    // Assignment exists and grade is provided
    assignment.setGrade(grade);
    this.observer.notify(this.fullName, assignmentName, assignment.status);
  }
};

Student.prototype.getAssignmentStatus = function(assignmentName) {
  const assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
  
  if (!assignment) {
    return "Hasn't been assigned";
  }
  
  if (assignment.status === 'pass') {
    return 'Pass';
  } else if (assignment.status === 'fail') {
    return 'Fail';
  }
  
  return assignment.status;
};

Student.prototype.startWorking = async function(assignmentName) {
  const assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
  
  if (assignment) {
    assignment.status = 'working';
    this.observer.notify(this.fullName, assignmentName, 'working');
    
    // Wait 500ms before submitting, unless interrupted by reminder
    this._workingTimeouts[assignmentName] = setTimeout(() => {
      this.submitAssignment(assignmentName);
      delete this._workingTimeouts[assignmentName];
    }, 500);
  }
};

Student.prototype.submitAssignment = async function(assignmentName) {
  const assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
  
  if (assignment) {
    // Clear any pending work timeout
    if (this._workingTimeouts[assignmentName]) {
      clearTimeout(this._workingTimeouts[assignmentName]);
      delete this._workingTimeouts[assignmentName];
    }
    
    assignment.status = 'submitted';
    this.observer.notify(this.fullName, assignmentName, 'submitted');
    
    // Asynchronously grade after 500ms
    setTimeout(() => {
      const randomGrade = Math.floor(Math.random() * 101); // 0 to 100
      this.updateAssignmentStatus(assignmentName, randomGrade);
    }, 500);
  }
};

Student.prototype.getGrade = function() {
  const gradedAssignments = this.assignmentStatuses.filter(a => a.getGrade() !== null);
  
  if (gradedAssignments.length === 0) {
    return 0;
  }
  
  const sum = gradedAssignments.reduce((total, a) => total + a.getGrade(), 0);
  return sum / gradedAssignments.length;
};

// ClassList Constructor Function
function ClassList(observer) {
  this.students = [];
  this.observer = observer;
}

ClassList.prototype.addStudent = function(student) {
  this.students.push(student);
  console.log(`${student.fullName} has been added to the classlist.`);
};

ClassList.prototype.removeStudent = function(studentName) {
  const index = this.students.findIndex(s => s.fullName === studentName);
  if (index !== -1) {
    this.students.splice(index, 1);
  }
};

ClassList.prototype.findStudentByName = function(name) {
  return this.students.find(s => s.fullName === name);
};

ClassList.prototype.findOutstandingAssignments = function(assignmentName = null) {
  const outstandingStudents = [];
  
  for (const student of this.students) {
    if (assignmentName) {
      // Check specific assignment
      const assignment = student.assignmentStatuses.find(a => a.assignmentName === assignmentName);
      
      if (assignment && assignment.status !== 'submitted' && 
          assignment.status !== 'pass' && assignment.status !== 'fail') {
        outstandingStudents.push(student.fullName);
      } else if (!assignment) {
        // Assignment hasn't been released to this student
        outstandingStudents.push(student.fullName);
      }
    } else {
      // Check for any outstanding assignment
      const hasOutstanding = student.assignmentStatuses.some(a => 
        a.status === 'released' || a.status === 'working' || a.status === 'final reminder'
      );
      
      if (hasOutstanding) {
        outstandingStudents.push(student.fullName);
      }
    }
  }
  
  return outstandingStudents;
};

ClassList.prototype.releaseAssignmentsParallel = async function(assignmentNames) {
  const promises = [];
  
  for (const student of this.students) {
    for (const assignmentName of assignmentNames) {
      // Create a promise for each assignment release
      const promise = new Promise((resolve) => {
        student.updateAssignmentStatus(assignmentName);
        resolve();
      });
      promises.push(promise);
    }
  }
  
  // Wait for all assignments to be released in parallel
  await Promise.all(promises);
};

ClassList.prototype.sendReminder = function(assignmentName) {
  for (const student of this.students) {
    const assignment = student.assignmentStatuses.find(a => a.assignmentName === assignmentName);
    
    if (assignment && assignment.status !== 'submitted' && 
        assignment.status !== 'pass' && assignment.status !== 'fail') {
      assignment.status = 'final reminder';
      this.observer.notify(student.fullName, assignmentName, 'final reminder');
      
      // Trigger early submission
      student.submitAssignment(assignmentName);
    }
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Assignment, Observer, Student, ClassList };
}