import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    userId : Nat;
    userType : UserType;
    schoolId : ?Nat;
  };

  public type UserType = {
    #superAdmin;
    #schoolAdmin;
    #teacher;
    #student;
  };

  public type School = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    username : Text;
    password : Text;
    isApproved : Bool;
  };

  public type SchoolBranding = {
    schoolId : Nat;
    motto : Text;
    websiteUrl : Text;
    logoBase64 : Text;
    stampBase64 : Text;
    signatureBase64 : Text;
  };

  public type Class = {
    id : Nat;
    schoolId : Nat;
    classLevel : Text;
    className : Text;
    arm : Text;
  };

  public type Subject = {
    id : Nat;
    schoolId : Nat;
    name : Text;
    code : Text;
    assignedClasses : [Nat];
    teacherId : ?Nat;
  };

  public type Teacher = {
    id : Nat;
    schoolId : Nat;
    fullName : Text;
    username : Text;
    phone : Text;
    email : Text;
    address : Text;
    password : Text;
  };

  public type Student = {
    id : Nat;
    schoolId : Nat;
    fullName : Text;
    gender : Text;
    classId : Nat;
    admissionNumber : Text;
    parentName : Text;
    parentPhone : Text;
    password : Text;
  };

  public type Session = {
    id : Nat;
    schoolId : Nat;
    name : Text;
    isActive : Bool;
  };

  public type Term = {
    id : Nat;
    schoolId : Nat;
    name : Text;
    isActive : Bool;
  };

  public type Score = {
    id : Nat;
    studentId : Nat;
    subjectId : Nat;
    teacherId : Nat;
    sessionId : Nat;
    termId : Nat;
    ca1 : Nat;
    ca2 : Nat;
    exam : Nat;
    total : Nat;
    grade : Text;
  };

  var nextSchoolId = 1;
  var nextClassId = 1;
  var nextSubjectId = 1;
  var nextTeacherId = 1;
  var nextStudentId = 1;
  var nextSessionId = 1;
  var nextTermId = 1;
  var nextScoreId = 1;

  let schools = Map.empty<Nat, School>();
  let schoolBrandings = Map.empty<Nat, SchoolBranding>();
  let classes = Map.empty<Nat, Class>();
  let subjects = Map.empty<Nat, Subject>();
  let teachers = Map.empty<Nat, Teacher>();
  let students = Map.empty<Nat, Student>();
  let sessions = Map.empty<Nat, Session>();
  let terms = Map.empty<Nat, Term>();
  let scores = Map.empty<Nat, Score>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Mapping from username to principal for authentication
  let schoolAdminAuth = Map.empty<Text, Principal>();
  let teacherAuth = Map.empty<Text, Principal>();
  let studentAuth = Map.empty<Text, Principal>();

  // Super Admin hardcoded credentials
  let SUPER_ADMIN_EMAIL = "e817500@gmail.com";
  let SUPER_ADMIN_PASSWORD = "0902881mM.";

  // Helper function to check if caller is super admin
  func isSuperAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#superAdmin) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // Helper function to check if caller is school admin for a specific school
  func isSchoolAdmin(caller : Principal, schoolId : Nat) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#schoolAdmin) {
            switch (profile.schoolId) {
              case (?sid) { sid == schoolId };
              case (null) { false };
            };
          };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // Helper function to check if caller is teacher for a specific school
  func isTeacher(caller : Principal, schoolId : Nat) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#teacher) {
            switch (profile.schoolId) {
              case (?sid) { sid == schoolId };
              case (null) { false };
            };
          };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // Helper function to check if caller is student
  func isStudent(caller : Principal, studentId : Nat) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#student) { profile.userId == studentId };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Super Admin login
  public shared ({ caller }) func loginSuperAdmin(email : Text, password : Text) : async Bool {
    if (email == SUPER_ADMIN_EMAIL and password == SUPER_ADMIN_PASSWORD) {
      let profile : UserProfile = {
        userId = 0;
        userType = #superAdmin;
        schoolId = null;
      };
      userProfiles.add(caller, profile);
      accessControlState.userRoles.add(caller, #admin);
      true;
    } else {
      false;
    };
  };

  // School registration (public - anyone can register)
  public shared ({ caller }) func registerSchool(name : Text, email : Text, phone : Text, address : Text, username : Text, password : Text) : async Nat {
    let id = nextSchoolId;
    nextSchoolId += 1;

    let school : School = {
      id;
      name;
      email;
      phone;
      address;
      username;
      password;
      isApproved = false;
    };

    schools.add(id, school);
    id;
  };

  // School Admin login
  public shared ({ caller }) func loginSchoolAdmin(username : Text, password : Text) : async ?Nat {
    for ((id, school) in schools.entries()) {
      if (school.username == username and school.password == password and school.isApproved) {
        let profile : UserProfile = {
          userId = id;
          userType = #schoolAdmin;
          schoolId = ?id;
        };
        userProfiles.add(caller, profile);
        schoolAdminAuth.add(username, caller);
        accessControlState.userRoles.add(caller, #user);
        return ?id;
      };
    };
    null;
  };

  // Teacher login
  public shared ({ caller }) func loginTeacher(username : Text, password : Text) : async ?Nat {
    for ((id, teacher) in teachers.entries()) {
      if (teacher.username == username and teacher.password == password) {
        let profile : UserProfile = {
          userId = id;
          userType = #teacher;
          schoolId = ?teacher.schoolId;
        };
        userProfiles.add(caller, profile);
        teacherAuth.add(username, caller);
        accessControlState.userRoles.add(caller, #user);
        return ?id;
      };
    };
    null;
  };

  // Student login
  public shared ({ caller }) func loginStudent(admissionNumber : Text, password : Text) : async ?Nat {
    for ((id, student) in students.entries()) {
      if (student.admissionNumber == admissionNumber and student.password == password) {
        let profile : UserProfile = {
          userId = id;
          userType = #student;
          schoolId = ?student.schoolId;
        };
        userProfiles.add(caller, profile);
        studentAuth.add(admissionNumber, caller);
        accessControlState.userRoles.add(caller, #user);
        return ?id;
      };
    };
    null;
  };

  // Approve school (Super Admin only)
  public shared ({ caller }) func approveSchool(schoolId : Nat) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can approve schools");
    };

    switch (schools.get(schoolId)) {
      case (null) { Runtime.trap("School not found") };
      case (?school) {
        let updatedSchool = {
          id = school.id;
          name = school.name;
          email = school.email;
          phone = school.phone;
          address = school.address;
          username = school.username;
          password = school.password;
          isApproved = true;
        };
        schools.add(schoolId, updatedSchool);
      };
    };
  };

  // Update school branding (School Admin only)
  public shared ({ caller }) func updateSchoolBranding(schoolId : Nat, motto : Text, websiteUrl : Text, logoBase64 : Text, stampBase64 : Text, signatureBase64 : Text) : async () {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can update branding for their school");
    };
    let branding : SchoolBranding = {
      schoolId;
      motto;
      websiteUrl;
      logoBase64;
      stampBase64;
      signatureBase64;
    };
    schoolBrandings.add(schoolId, branding);
  };

  // Get school branding (public query - teachers, students and admins can read it)
  public query func getSchoolBranding(schoolId : Nat) : async ?SchoolBranding {
    schoolBrandings.get(schoolId);
  };

  // Add class (School Admin only, for their school)
  public shared ({ caller }) func addClass(schoolId : Nat, classLevel : Text, className : Text, arm : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can add classes to their school");
    };

    let id = nextClassId;
    nextClassId += 1;

    let newClass : Class = {
      id;
      schoolId;
      classLevel;
      className;
      arm;
    };

    classes.add(id, newClass);
    id;
  };

  // Add subject (School Admin only, for their school)
  public shared ({ caller }) func addSubject(schoolId : Nat, name : Text, code : Text, assignedClasses : [Nat], teacherId : ?Nat) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can add subjects to their school");
    };

    let id = nextSubjectId;
    nextSubjectId += 1;

    let subject : Subject = {
      id;
      schoolId;
      name;
      code;
      assignedClasses;
      teacherId;
    };

    subjects.add(id, subject);
    id;
  };

  // Add teacher (School Admin only, for their school)
  public shared ({ caller }) func addTeacher(schoolId : Nat, fullName : Text, username : Text, phone : Text, email : Text, address : Text, password : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can add teachers to their school");
    };

    let id = nextTeacherId;
    nextTeacherId += 1;

    let teacher : Teacher = {
      id;
      schoolId;
      fullName;
      username;
      phone;
      email;
      address;
      password;
    };

    teachers.add(id, teacher);
    id;
  };

  // Add student (School Admin only, for their school)
  public shared ({ caller }) func addStudent(schoolId : Nat, fullName : Text, gender : Text, classId : Nat, admissionNumber : Text, parentName : Text, parentPhone : Text, password : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can add students to their school");
    };

    let id = nextStudentId;
    nextStudentId += 1;

    let student : Student = {
      id;
      schoolId;
      fullName;
      gender;
      classId;
      admissionNumber;
      parentName;
      parentPhone;
      password;
    };

    students.add(id, student);
    id;
  };

  // Add session (School Admin only, for their school)
  public shared ({ caller }) func addSession(schoolId : Nat, name : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can add sessions to their school");
    };

    let id = nextSessionId;
    nextSessionId += 1;

    let session : Session = {
      id;
      schoolId;
      name;
      isActive = false;
    };

    sessions.add(id, session);
    id;
  };

  // Activate session (School Admin only, for their school)
  public shared ({ caller }) func activateSession(sessionId : Nat) : async () {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        if (not isSchoolAdmin(caller, session.schoolId)) {
          Runtime.trap("Unauthorized: Only School Admin can activate sessions for their school");
        };

        // Deactivate all other sessions for this school
        for ((id, s) in sessions.entries()) {
          if (s.schoolId == session.schoolId and s.isActive) {
            let deactivated = {
              id = s.id;
              schoolId = s.schoolId;
              name = s.name;
              isActive = false;
            };
            sessions.add(id, deactivated);
          };
        };

        let updatedSession = {
          id = session.id;
          schoolId = session.schoolId;
          name = session.name;
          isActive = true;
        };
        sessions.add(sessionId, updatedSession);
      };
    };
  };

  // Add term (School Admin only, for their school)
  public shared ({ caller }) func addTerm(schoolId : Nat, name : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only School Admin can add terms to their school");
    };

    let id = nextTermId;
    nextTermId += 1;

    let term : Term = {
      id;
      schoolId;
      name;
      isActive = false;
    };

    terms.add(id, term);
    id;
  };

  // Activate term (School Admin only, for their school)
  public shared ({ caller }) func activateTerm(termId : Nat) : async () {
    switch (terms.get(termId)) {
      case (null) { Runtime.trap("Term not found") };
      case (?term) {
        if (not isSchoolAdmin(caller, term.schoolId)) {
          Runtime.trap("Unauthorized: Only School Admin can activate terms for their school");
        };

        // Deactivate all other terms for this school
        for ((id, t) in terms.entries()) {
          if (t.schoolId == term.schoolId and t.isActive) {
            let deactivated = {
              id = t.id;
              schoolId = t.schoolId;
              name = t.name;
              isActive = false;
            };
            terms.add(id, deactivated);
          };
        };

        // Reset all scores for this school when activating new term
        for ((id, score) in scores.entries()) {
          switch (students.get(score.studentId)) {
            case (?student) {
              if (student.schoolId == term.schoolId) {
                scores.remove(id);
              };
            };
            case (null) {};
          };
        };

        let updatedTerm = {
          id = term.id;
          schoolId = term.schoolId;
          name = term.name;
          isActive = true;
        };
        terms.add(termId, updatedTerm);
      };
    };
  };

  // Enter score (Teacher only, for their assigned subjects)
  public shared ({ caller }) func enterScore(studentId : Nat, subjectId : Nat, teacherId : Nat, sessionId : Nat, termId : Nat, ca1 : Nat, ca2 : Nat, exam : Nat) : async Nat {
    // Verify teacher identity
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#teacher) {
            if (profile.userId != teacherId) {
              Runtime.trap("Unauthorized: Teacher ID mismatch");
            };
          };
          case (_) {
            Runtime.trap("Unauthorized: Only teachers can enter scores");
          };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User not logged in");
      };
    };

    // Verify subject assignment
    switch (subjects.get(subjectId)) {
      case (?subject) {
        switch (subject.teacherId) {
          case (?tid) {
            if (tid != teacherId) {
              Runtime.trap("Unauthorized: Teacher not assigned to this subject");
            };
          };
          case (null) {
            Runtime.trap("Unauthorized: No teacher assigned to this subject");
          };
        };

        // Verify student belongs to same school
        switch (students.get(studentId)) {
          case (?student) {
            if (student.schoolId != subject.schoolId) {
              Runtime.trap("Unauthorized: Student and subject belong to different schools");
            };
          };
          case (null) {
            Runtime.trap("Student not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Subject not found");
      };
    };

    // Validate score ranges
    if (ca1 > 20 or ca2 > 20 or exam > 60) {
      Runtime.trap("Invalid score: CA1 and CA2 max 20, Exam max 60");
    };

    let total = ca1 + ca2 + exam;
    let grade = calcGrade(total);

    let id = nextScoreId;
    nextScoreId += 1;

    let score : Score = {
      id;
      studentId;
      subjectId;
      teacherId;
      sessionId;
      termId;
      ca1;
      ca2;
      exam;
      total;
      grade;
    };

    scores.add(id, score);
    id;
  };

  func calcGrade(total : Nat) : Text {
    if (total >= 70) { "A" } else if (total >= 60) { "B" } else if (total >= 50) { "C" } else if (total >= 45) { "D" } else if (total >= 40) { "E" } else {
      "F";
    };
  };

  // Get school (Super Admin or School Admin for their school)
  public query ({ caller }) func getSchool(id : Nat) : async ?School {
    if (not (isSuperAdmin(caller) or isSchoolAdmin(caller, id))) {
      Runtime.trap("Unauthorized: Can only view your own school");
    };
    schools.get(id);
  };

  // Get class (School Admin or Teacher for their school)
  public query ({ caller }) func getClass(id : Nat) : async ?Class {
    switch (classes.get(id)) {
      case (?cls) {
        if (not (isSchoolAdmin(caller, cls.schoolId) or isTeacher(caller, cls.schoolId))) {
          Runtime.trap("Unauthorized: Can only view classes from your school");
        };
        ?cls;
      };
      case (null) { null };
    };
  };

  // Get subject (School Admin or Teacher for their school)
  public query ({ caller }) func getSubject(id : Nat) : async ?Subject {
    switch (subjects.get(id)) {
      case (?subject) {
        if (not (isSchoolAdmin(caller, subject.schoolId) or isTeacher(caller, subject.schoolId))) {
          Runtime.trap("Unauthorized: Can only view subjects from your school");
        };
        ?subject;
      };
      case (null) { null };
    };
  };

  // Get teacher (School Admin for their school)
  public query ({ caller }) func getTeacher(id : Nat) : async ?Teacher {
    switch (teachers.get(id)) {
      case (?teacher) {
        if (not isSchoolAdmin(caller, teacher.schoolId)) {
          Runtime.trap("Unauthorized: Can only view teachers from your school");
        };
        ?teacher;
      };
      case (null) { null };
    };
  };

  // Get student (School Admin, Teacher, or the student themselves)
  public query ({ caller }) func getStudent(id : Nat) : async ?Student {
    switch (students.get(id)) {
      case (?student) {
        if (not (isSchoolAdmin(caller, student.schoolId) or isTeacher(caller, student.schoolId) or isStudent(caller, id))) {
          Runtime.trap("Unauthorized: Can only view students from your school or yourself");
        };
        ?student;
      };
      case (null) { null };
    };
  };

  // Get session (School Admin or Teacher for their school)
  public query ({ caller }) func getSession(id : Nat) : async ?Session {
    switch (sessions.get(id)) {
      case (?session) {
        if (not (isSchoolAdmin(caller, session.schoolId) or isTeacher(caller, session.schoolId))) {
          Runtime.trap("Unauthorized: Can only view sessions from your school");
        };
        ?session;
      };
      case (null) { null };
    };
  };

  // Get term (School Admin or Teacher for their school)
  public query ({ caller }) func getTerm(id : Nat) : async ?Term {
    switch (terms.get(id)) {
      case (?term) {
        if (not (isSchoolAdmin(caller, term.schoolId) or isTeacher(caller, term.schoolId))) {
          Runtime.trap("Unauthorized: Can only view terms from your school");
        };
        ?term;
      };
      case (null) { null };
    };
  };

  // Get score (School Admin, Teacher, or Student viewing their own score)
  public query ({ caller }) func getScore(id : Nat) : async ?Score {
    switch (scores.get(id)) {
      case (?score) {
        switch (students.get(score.studentId)) {
          case (?student) {
            if (not (isSchoolAdmin(caller, student.schoolId) or isTeacher(caller, student.schoolId) or isStudent(caller, score.studentId))) {
              Runtime.trap("Unauthorized: Can only view scores from your school or your own scores");
            };
            ?score;
          };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  // Search students (School Admin or Teacher for their school)
  public query ({ caller }) func searchStudentsByName(schoolId : Nat, name : Text) : async [Student] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) {
      Runtime.trap("Unauthorized: Can only search students from your school");
    };
    students.values().toArray().filter(func(student) { student.schoolId == schoolId and student.fullName.contains(#text name) });
  };

  // Search teachers (School Admin for their school)
  public query ({ caller }) func searchTeachersByName(schoolId : Nat, name : Text) : async [Teacher] {
    if (not isSchoolAdmin(caller, schoolId)) {
      Runtime.trap("Unauthorized: Can only search teachers from your school");
    };
    teachers.values().toArray().filter(func(teacher) { teacher.schoolId == schoolId and teacher.fullName.contains(#text name) });
  };

  // Search classes (School Admin or Teacher for their school)
  public query ({ caller }) func searchClassesByName(schoolId : Nat, name : Text) : async [Class] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) {
      Runtime.trap("Unauthorized: Can only search classes from your school");
    };
    classes.values().toArray().filter(func(cls) { cls.schoolId == schoolId and cls.className.contains(#text name) });
  };

  // Search subjects (School Admin or Teacher for their school)
  public query ({ caller }) func searchSubjectsByName(schoolId : Nat, name : Text) : async [Subject] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) {
      Runtime.trap("Unauthorized: Can only search subjects from your school");
    };
    subjects.values().toArray().filter(func(subject) { subject.schoolId == schoolId and subject.name.contains(#text name) });
  };

  // List all schools (Super Admin only)
  public query ({ caller }) func listAllSchools() : async [School] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can list all schools");
    };
    schools.values().toArray();
  };

  // Get student scores (Student viewing their own scores)
  public query ({ caller }) func getStudentScores(studentId : Nat) : async [Score] {
    if (not isStudent(caller, studentId)) {
      switch (students.get(studentId)) {
        case (?student) {
          if (not (isSchoolAdmin(caller, student.schoolId) or isTeacher(caller, student.schoolId))) {
            Runtime.trap("Unauthorized: Can only view your own scores or scores from your school");
          };
        };
        case (null) {
          Runtime.trap("Student not found");
        };
      };
    };
    scores.values().toArray().filter(func(score) { score.studentId == studentId });
  };

  // Get own teacher profile (for use right after login - update call avoids stale query state)
  public shared ({ caller }) func getTeacherSelf() : async ?Teacher {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#teacher) { teachers.get(profile.userId) };
          case (_) { null };
        };
      };
      case (null) { null };
    };
  };

  // Get own student profile (for use right after login - update call avoids stale query state)
  public shared ({ caller }) func getStudentSelf() : async ?Student {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#student) { students.get(profile.userId) };
          case (_) { null };
        };
      };
      case (null) { null };
    };
  };


  // Get own school (for use right after login - update call avoids stale query state)
  public shared ({ caller }) func getSchoolSelf() : async ?School {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#schoolAdmin) {
            switch (profile.schoolId) {
              case (?sid) { schools.get(sid) };
              case (null) { null };
            };
          };
          case (_) { null };
        };
      };
      case (null) { null };
    };
  };
  // Update teacher (School Admin only)
  public shared ({ caller }) func updateTeacher(teacherId : Nat, fullName : Text, username : Text, phone : Text, email : Text, address : Text) : async () {
    switch (teachers.get(teacherId)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        if (not isSchoolAdmin(caller, teacher.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        teachers.add(teacherId, {
          id = teacher.id;
          schoolId = teacher.schoolId;
          fullName = fullName;
          username = username;
          phone = phone;
          email = email;
          address = address;
          password = teacher.password;
        });
      };
    };
  };

  // Delete teacher (School Admin only)
  public shared ({ caller }) func deleteTeacher(teacherId : Nat) : async () {
    switch (teachers.get(teacherId)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        if (not isSchoolAdmin(caller, teacher.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        teachers.remove(teacherId);
      };
    };
  };

  // Update student (School Admin only)
  public shared ({ caller }) func updateStudent(studentId : Nat, fullName : Text, gender : Text, classId : Nat, admissionNumber : Text, parentName : Text, parentPhone : Text) : async () {
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (not isSchoolAdmin(caller, student.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        students.add(studentId, {
          id = student.id;
          schoolId = student.schoolId;
          fullName = fullName;
          gender = gender;
          classId = classId;
          admissionNumber = admissionNumber;
          parentName = parentName;
          parentPhone = parentPhone;
          password = student.password;
        });
      };
    };
  };

  // Delete student (School Admin only)
  public shared ({ caller }) func deleteStudent(studentId : Nat) : async () {
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (not isSchoolAdmin(caller, student.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        students.remove(studentId);
      };
    };
  };

  // Update class (School Admin only)
  public shared ({ caller }) func updateClass(classId : Nat, classLevel : Text, className : Text, arm : Text) : async () {
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?cls) {
        if (not isSchoolAdmin(caller, cls.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        classes.add(classId, {
          id = cls.id;
          schoolId = cls.schoolId;
          classLevel = classLevel;
          className = className;
          arm = arm;
        });
      };
    };
  };

  // Delete class (School Admin only)
  public shared ({ caller }) func deleteClass(classId : Nat) : async () {
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?cls) {
        if (not isSchoolAdmin(caller, cls.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        classes.remove(classId);
      };
    };
  };

  // Update subject (School Admin only)
  public shared ({ caller }) func updateSubject(subjectId : Nat, name : Text, code : Text, assignedClasses : [Nat], teacherId : ?Nat) : async () {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        if (not isSchoolAdmin(caller, subject.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        subjects.add(subjectId, {
          id = subject.id;
          schoolId = subject.schoolId;
          name = name;
          code = code;
          assignedClasses = assignedClasses;
          teacherId = teacherId;
        });
      };
    };
  };

  // Delete subject (School Admin only)
  public shared ({ caller }) func deleteSubject(subjectId : Nat) : async () {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        if (not isSchoolAdmin(caller, subject.schoolId)) {
          Runtime.trap("Unauthorized");
        };
        subjects.remove(subjectId);
      };
    };
  };
};
