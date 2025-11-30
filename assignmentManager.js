* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    padding: 20px;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    background-color: white;
    padding: 20px;
}

h1 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 2em;
}

h2 {
    font-size: 1.3em;
    margin-bottom: 15px;
}

/* Upload Section */
.upload-section {
    background-color: #f9f9f9;
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 5px;
    margin-bottom: 20px;
}

#fileInput {
    margin-right: 10px;
}

#fileName {
    color: #666;
    font-style: italic;
}

.error-message {
    color: red;
    font-weight: bold;
    margin-top: 10px;
    display: none;
}

.error-message.show {
    display: block;
}

/* Filter Section */
.filter-section {
    background-color: #f0f0f0;
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 5px;
    margin-bottom: 20px;
}

.filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
}

.filter-controls label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: bold;
}

.filter-controls select {
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
    background-color: white;
    cursor: pointer;
    min-width: 150px;
}

/* Content Area */
.content-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    min-height: 500px;
}

/* Course List Section */
.course-list-section {
    border: 2px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    background-color: #fafafa;
}

.course-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.course-item {
    padding: 15px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.course-item:hover {
    background-color: #f0f0f0;
    border-color: #999;
}
// Assignment Class
class Assignment {
  constructor(assignmentName) {
    this.assignmentName = assignmentName;
    this.status = 'released';
    this._grade = null; // Private grade property
  }

  setGrade(grade) {
    this._grade = grade;
    if (grade > 50) {
      this.status = 'pass';
    } else {
      this.status = 'fail';
    }
  }

  getGrade() {
    return this._grade;
  }
}

// Observer Class
class Observer {
  notify(studentName, assignmentName, status) {
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
  }
}

// Student Class
class Student {
  constructor(fullName, email, observer) {
    this.fullName = fullName;
    this.email = email;
    this.assignmentStatuses = [];
    this.observer = observer;
    this._workingTimeouts = {}; // Track working timeouts for early submission
  }

  setFullName(name) {
    this.fullName = name;
  }

  setEmail(email) {
    this.email = email;
  }

  updateAssignmentStatus(assignmentName, grade = null) {
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
  }

  getAssignmentStatus(assignmentName) {
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
  }

  async startWorking(assignmentName) {
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
  }

  async submitAssignment(assignmentName) {
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
  }

  getGrade() {
    const gradedAssignments = this.assignmentStatuses.filter(a => a.getGrade() !== null);
    
    if (gradedAssignments.length === 0) {
      return 0;
    }
    
    const sum = gradedAssignments.reduce((total, a) => total + a.getGrade(), 0);
    return sum / gradedAssignments.length;
  }
}

// ClassList Class
class ClassList {
  constructor(observer) {
    this.students = [];
    this.observer = observer;
  }

  addStudent(student) {
    this.students.push(student);
    console.log(`${student.fullName} has been added to the classlist.`);
  }

  removeStudent(studentName) {
    const index = this.students.findIndex(s => s.fullName === studentName);
    if (index !== -1) {
      this.students.splice(index, 1);
    }
  }

  findStudentByName(name) {
    return this.students.find(s => s.fullName === name);
  }

  findOutstandingAssignments(assignmentName = null) {
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
  }

  async releaseAssignmentsParallel(assignmentNames) {
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
  }

  sendReminder(assignmentName) {
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
  }
}

// === Example Usage ===
const observer = new Observer();
const classList = new ClassList(observer);

const s1 = new Student("Alice Smith", "alice@example.com", observer);
const s2 = new Student("Bob Jones", "bob@example.com", observer);

classList.addStudent(s1);
classList.addStudent(s2);

// An example of calling startWorking and sending reminders
// Timing could vary in other tests!
classList.releaseAssignmentsParallel(["A1", "A2"]).then(() => {
  s1.startWorking("A1");
  s2.startWorking("A2");

  setTimeout(() => classList.sendReminder("A1"), 200);
});