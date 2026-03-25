import Map "mo:core/Map";
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

  // ── Stable counters (survive upgrades) ──────────────────────────────────────
  var nextSchoolId = 1;
  var nextClassId = 1;
  var nextSubjectId = 1;
  var nextTeacherId = 1;
  var nextStudentId = 1;
  var nextSessionId = 1;
  var nextTermId = 1;
  var nextScoreId = 1;

  // ── Stable backing arrays (survive upgrades) ────────────────────────────────
  var schoolsStable : [(Nat, School)] = [];
  var schoolBrandingsStable : [(Nat, SchoolBranding)] = [];
  var classesStable : [(Nat, Class)] = [];
  var subjectsStable : [(Nat, Subject)] = [];
  var teachersStable : [(Nat, Teacher)] = [];
  var studentsStable : [(Nat, Student)] = [];
  var sessionsStable : [(Nat, Session)] = [];
  var termsStable : [(Nat, Term)] = [];
  var scoresStable : [(Nat, Score)] = [];
  var userProfilesStable : [(Principal, UserProfile)] = [];
  var schoolAdminAuthStable : [(Text, Principal)] = [];
  var teacherAuthStable : [(Text, Principal)] = [];
  var studentAuthStable : [(Text, Principal)] = [];

  // ── Working maps (rebuilt after upgrade) ────────────────────────────────────
  var schools = Map.empty<Nat, School>();
  var schoolBrandings = Map.empty<Nat, SchoolBranding>();
  var classes = Map.empty<Nat, Class>();
  var subjects = Map.empty<Nat, Subject>();
  var teachers = Map.empty<Nat, Teacher>();
  var students = Map.empty<Nat, Student>();
  var sessions = Map.empty<Nat, Session>();
  var terms = Map.empty<Nat, Term>();
  var scores = Map.empty<Nat, Score>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var schoolAdminAuth = Map.empty<Text, Principal>();
  var teacherAuth = Map.empty<Text, Principal>();
  var studentAuth = Map.empty<Text, Principal>();

  // ── Upgrade hooks ────────────────────────────────────────────────────────────
  system func preupgrade() {
    schoolsStable := schools.entries().toArray();
    schoolBrandingsStable := schoolBrandings.entries().toArray();
    classesStable := classes.entries().toArray();
    subjectsStable := subjects.entries().toArray();
    teachersStable := teachers.entries().toArray();
    studentsStable := students.entries().toArray();
    sessionsStable := sessions.entries().toArray();
    termsStable := terms.entries().toArray();
    scoresStable := scores.entries().toArray();
    userProfilesStable := userProfiles.entries().toArray();
    schoolAdminAuthStable := schoolAdminAuth.entries().toArray();
    teacherAuthStable := teacherAuth.entries().toArray();
    studentAuthStable := studentAuth.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in schoolsStable.vals()) { schools.add(k, v) };
    for ((k, v) in schoolBrandingsStable.vals()) { schoolBrandings.add(k, v) };
    for ((k, v) in classesStable.vals()) { classes.add(k, v) };
    for ((k, v) in subjectsStable.vals()) { subjects.add(k, v) };
    for ((k, v) in teachersStable.vals()) { teachers.add(k, v) };
    for ((k, v) in studentsStable.vals()) { students.add(k, v) };
    for ((k, v) in sessionsStable.vals()) { sessions.add(k, v) };
    for ((k, v) in termsStable.vals()) { terms.add(k, v) };
    for ((k, v) in scoresStable.vals()) { scores.add(k, v) };
    for ((k, v) in userProfilesStable.vals()) { userProfiles.add(k, v) };
    for ((k, v) in schoolAdminAuthStable.vals()) { schoolAdminAuth.add(k, v) };
    for ((k, v) in teacherAuthStable.vals()) { teacherAuth.add(k, v) };
    for ((k, v) in studentAuthStable.vals()) { studentAuth.add(k, v) };
    // free stable memory after reload
    schoolsStable := [];
    schoolBrandingsStable := [];
    classesStable := [];
    subjectsStable := [];
    teachersStable := [];
    studentsStable := [];
    sessionsStable := [];
    termsStable := [];
    scoresStable := [];
    userProfilesStable := [];
    schoolAdminAuthStable := [];
    teacherAuthStable := [];
    studentAuthStable := [];
  };

  // Super Admin hardcoded credentials
  let SUPER_ADMIN_EMAIL = "e817500@gmail.com";
  let SUPER_ADMIN_PASSWORD = "0902881mM.";

  // Helper: trim whitespace
  func trim(t : Text) : Text {
    t.trim(#predicate(func(c) { c == ' ' or c == '\t' or c == '\n' or c == '\r' }));
  };

  func isSuperAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.userType == #superAdmin };
      case (null) { false };
    };
  };

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

  // ── User profile management ──────────────────────────────────────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ── Authentication ───────────────────────────────────────────────────────────
  public shared ({ caller }) func loginSuperAdmin(email : Text, password : Text) : async Bool {
    if (trim(email) == SUPER_ADMIN_EMAIL and trim(password) == SUPER_ADMIN_PASSWORD) {
      let profile : UserProfile = { userId = 0; userType = #superAdmin; schoolId = null };
      userProfiles.add(caller, profile);
      accessControlState.userRoles.add(caller, #admin);
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func loginSchoolAdmin(username : Text, password : Text) : async ?Nat {
    let u = trim(username);
    let p = trim(password);
    for ((id, school) in schools.entries()) {
      if (school.username == u and school.password == p and school.isApproved) {
        let profile : UserProfile = { userId = id; userType = #schoolAdmin; schoolId = ?id };
        userProfiles.add(caller, profile);
        schoolAdminAuth.add(u, caller);
        accessControlState.userRoles.add(caller, #user);
        return ?id;
      };
    };
    null;
  };

  public shared ({ caller }) func loginTeacher(username : Text, password : Text) : async ?Nat {
    let u = trim(username);
    let p = trim(password);
    for ((id, teacher) in teachers.entries()) {
      if (teacher.username == u and teacher.password == p) {
        let profile : UserProfile = { userId = id; userType = #teacher; schoolId = ?teacher.schoolId };
        userProfiles.add(caller, profile);
        teacherAuth.add(u, caller);
        accessControlState.userRoles.add(caller, #user);
        return ?id;
      };
    };
    null;
  };

  public shared ({ caller }) func loginStudent(admissionNumber : Text, password : Text) : async ?Nat {
    let a = trim(admissionNumber);
    let p = trim(password);
    for ((id, student) in students.entries()) {
      if (student.admissionNumber == a and student.password == p) {
        let profile : UserProfile = { userId = id; userType = #student; schoolId = ?student.schoolId };
        userProfiles.add(caller, profile);
        studentAuth.add(a, caller);
        accessControlState.userRoles.add(caller, #user);
        return ?id;
      };
    };
    null;
  };

  // ── Post-login update calls (avoids stale query state on ICP) ───────────────
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

  // ── School management ────────────────────────────────────────────────────────
  public shared func registerSchool(name : Text, email : Text, phone : Text, address : Text, username : Text, password : Text) : async Nat {
    let id = nextSchoolId;
    nextSchoolId += 1;
    schools.add(id, { id; name; email; phone; address; username; password; isApproved = false });
    id;
  };

  public shared ({ caller }) func approveSchool(schoolId : Nat) : async () {
    if (not isSuperAdmin(caller)) { Runtime.trap("Unauthorized") };
    switch (schools.get(schoolId)) {
      case (null) { Runtime.trap("School not found") };
      case (?school) {
        schools.add(schoolId, { id = school.id; name = school.name; email = school.email; phone = school.phone; address = school.address; username = school.username; password = school.password; isApproved = true });
      };
    };
  };

  public query ({ caller }) func listAllSchools() : async [School] {
    if (not isSuperAdmin(caller)) { Runtime.trap("Unauthorized") };
    schools.values().toArray();
  };

  public query ({ caller }) func getSchool(id : Nat) : async ?School {
    if (not (isSuperAdmin(caller) or isSchoolAdmin(caller, id))) {
      Runtime.trap("Unauthorized");
    };
    schools.get(id);
  };

  // ── Branding ─────────────────────────────────────────────────────────────────
  public shared ({ caller }) func updateSchoolBranding(schoolId : Nat, motto : Text, websiteUrl : Text, logoBase64 : Text, stampBase64 : Text, signatureBase64 : Text) : async () {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    schoolBrandings.add(schoolId, { schoolId; motto; websiteUrl; logoBase64; stampBase64; signatureBase64 });
  };

  public query func getSchoolBranding(schoolId : Nat) : async ?SchoolBranding {
    schoolBrandings.get(schoolId);
  };

  // ── Classes ──────────────────────────────────────────────────────────────────
  public shared ({ caller }) func addClass(schoolId : Nat, classLevel : Text, className : Text, arm : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    let id = nextClassId;
    nextClassId += 1;
    classes.add(id, { id; schoolId; classLevel; className; arm });
    id;
  };

  public shared ({ caller }) func updateClass(classId : Nat, classLevel : Text, className : Text, arm : Text) : async () {
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?cls) {
        if (not isSchoolAdmin(caller, cls.schoolId)) { Runtime.trap("Unauthorized") };
        classes.add(classId, { id = cls.id; schoolId = cls.schoolId; classLevel; className; arm });
      };
    };
  };

  public shared ({ caller }) func deleteClass(classId : Nat) : async () {
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?cls) {
        if (not isSchoolAdmin(caller, cls.schoolId)) { Runtime.trap("Unauthorized") };
        classes.remove(classId);
      };
    };
  };

  public query ({ caller }) func getClass(id : Nat) : async ?Class {
    switch (classes.get(id)) {
      case (?cls) {
        if (not (isSchoolAdmin(caller, cls.schoolId) or isTeacher(caller, cls.schoolId))) { Runtime.trap("Unauthorized") };
        ?cls;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listClasses(schoolId : Nat) : async [Class] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    classes.values().toArray().filter(func(c) { c.schoolId == schoolId });
  };

  public query ({ caller }) func searchClassesByName(schoolId : Nat, name : Text) : async [Class] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    classes.values().toArray().filter(func(c) { c.schoolId == schoolId and c.className.contains(#text name) });
  };

  // ── Subjects ─────────────────────────────────────────────────────────────────
  public shared ({ caller }) func addSubject(schoolId : Nat, name : Text, code : Text, assignedClasses : [Nat], teacherId : ?Nat) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    let id = nextSubjectId;
    nextSubjectId += 1;
    subjects.add(id, { id; schoolId; name; code; assignedClasses; teacherId });
    id;
  };

  public shared ({ caller }) func updateSubject(subjectId : Nat, name : Text, code : Text, assignedClasses : [Nat], teacherId : ?Nat) : async () {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        if (not isSchoolAdmin(caller, subject.schoolId)) { Runtime.trap("Unauthorized") };
        subjects.add(subjectId, { id = subject.id; schoolId = subject.schoolId; name; code; assignedClasses; teacherId });
      };
    };
  };

  public shared ({ caller }) func deleteSubject(subjectId : Nat) : async () {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        if (not isSchoolAdmin(caller, subject.schoolId)) { Runtime.trap("Unauthorized") };
        subjects.remove(subjectId);
      };
    };
  };

  public query ({ caller }) func getSubject(id : Nat) : async ?Subject {
    switch (subjects.get(id)) {
      case (?subject) {
        if (not (isSchoolAdmin(caller, subject.schoolId) or isTeacher(caller, subject.schoolId))) { Runtime.trap("Unauthorized") };
        ?subject;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listSubjects(schoolId : Nat) : async [Subject] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    subjects.values().toArray().filter(func(s) { s.schoolId == schoolId });
  };

  public query ({ caller }) func searchSubjectsByName(schoolId : Nat, name : Text) : async [Subject] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    subjects.values().toArray().filter(func(s) { s.schoolId == schoolId and s.name.contains(#text name) });
  };

  // ── Teachers ─────────────────────────────────────────────────────────────────
  public shared ({ caller }) func addTeacher(schoolId : Nat, fullName : Text, username : Text, phone : Text, email : Text, address : Text, password : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    let id = nextTeacherId;
    nextTeacherId += 1;
    teachers.add(id, { id; schoolId; fullName; username; phone; email; address; password });
    id;
  };

  public shared ({ caller }) func updateTeacher(teacherId : Nat, fullName : Text, username : Text, phone : Text, email : Text, address : Text) : async () {
    switch (teachers.get(teacherId)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        if (not isSchoolAdmin(caller, teacher.schoolId)) { Runtime.trap("Unauthorized") };
        teachers.add(teacherId, { id = teacher.id; schoolId = teacher.schoolId; fullName; username; phone; email; address; password = teacher.password });
      };
    };
  };

  public shared ({ caller }) func deleteTeacher(teacherId : Nat) : async () {
    switch (teachers.get(teacherId)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        if (not isSchoolAdmin(caller, teacher.schoolId)) { Runtime.trap("Unauthorized") };
        teachers.remove(teacherId);
      };
    };
  };

  public query ({ caller }) func getTeacher(id : Nat) : async ?Teacher {
    switch (teachers.get(id)) {
      case (?teacher) {
        if (not isSchoolAdmin(caller, teacher.schoolId)) { Runtime.trap("Unauthorized") };
        ?teacher;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listTeachers(schoolId : Nat) : async [Teacher] {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    teachers.values().toArray().filter(func(t) { t.schoolId == schoolId });
  };

  public query ({ caller }) func searchTeachersByName(schoolId : Nat, name : Text) : async [Teacher] {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    teachers.values().toArray().filter(func(t) { t.schoolId == schoolId and t.fullName.contains(#text name) });
  };

  // ── Students ─────────────────────────────────────────────────────────────────
  public shared ({ caller }) func addStudent(schoolId : Nat, fullName : Text, gender : Text, classId : Nat, admissionNumber : Text, parentName : Text, parentPhone : Text, password : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    let id = nextStudentId;
    nextStudentId += 1;
    students.add(id, { id; schoolId; fullName; gender; classId; admissionNumber; parentName; parentPhone; password });
    id;
  };

  public shared ({ caller }) func updateStudent(studentId : Nat, fullName : Text, gender : Text, classId : Nat, admissionNumber : Text, parentName : Text, parentPhone : Text) : async () {
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (not isSchoolAdmin(caller, student.schoolId)) { Runtime.trap("Unauthorized") };
        students.add(studentId, { id = student.id; schoolId = student.schoolId; fullName; gender; classId; admissionNumber; parentName; parentPhone; password = student.password });
      };
    };
  };

  public shared ({ caller }) func deleteStudent(studentId : Nat) : async () {
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (not isSchoolAdmin(caller, student.schoolId)) { Runtime.trap("Unauthorized") };
        students.remove(studentId);
      };
    };
  };

  public query ({ caller }) func getStudent(id : Nat) : async ?Student {
    switch (students.get(id)) {
      case (?student) {
        if (not (isSchoolAdmin(caller, student.schoolId) or isTeacher(caller, student.schoolId) or isStudent(caller, id))) { Runtime.trap("Unauthorized") };
        ?student;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listStudents(schoolId : Nat) : async [Student] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    students.values().toArray().filter(func(s) { s.schoolId == schoolId });
  };

  public query ({ caller }) func searchStudentsByName(schoolId : Nat, name : Text) : async [Student] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    students.values().toArray().filter(func(s) { s.schoolId == schoolId and s.fullName.contains(#text name) });
  };

  // ── Sessions ─────────────────────────────────────────────────────────────────
  public shared ({ caller }) func addSession(schoolId : Nat, name : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    let id = nextSessionId;
    nextSessionId += 1;
    sessions.add(id, { id; schoolId; name; isActive = false });
    id;
  };

  public shared ({ caller }) func activateSession(sessionId : Nat) : async () {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        if (not isSchoolAdmin(caller, session.schoolId)) { Runtime.trap("Unauthorized") };
        for ((id, s) in sessions.entries()) {
          if (s.schoolId == session.schoolId and s.isActive) {
            sessions.add(id, { id = s.id; schoolId = s.schoolId; name = s.name; isActive = false });
          };
        };
        sessions.add(sessionId, { id = session.id; schoolId = session.schoolId; name = session.name; isActive = true });
      };
    };
  };

  public query ({ caller }) func getSession(id : Nat) : async ?Session {
    switch (sessions.get(id)) {
      case (?session) {
        if (not (isSchoolAdmin(caller, session.schoolId) or isTeacher(caller, session.schoolId))) { Runtime.trap("Unauthorized") };
        ?session;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listSessions(schoolId : Nat) : async [Session] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    sessions.values().toArray().filter(func(s) { s.schoolId == schoolId });
  };

  // ── Terms ────────────────────────────────────────────────────────────────────
  public shared ({ caller }) func addTerm(schoolId : Nat, name : Text) : async Nat {
    if (not isSchoolAdmin(caller, schoolId)) { Runtime.trap("Unauthorized") };
    let id = nextTermId;
    nextTermId += 1;
    terms.add(id, { id; schoolId; name; isActive = false });
    id;
  };

  public shared ({ caller }) func activateTerm(termId : Nat) : async () {
    switch (terms.get(termId)) {
      case (null) { Runtime.trap("Term not found") };
      case (?term) {
        if (not isSchoolAdmin(caller, term.schoolId)) { Runtime.trap("Unauthorized") };
        for ((id, t) in terms.entries()) {
          if (t.schoolId == term.schoolId and t.isActive) {
            terms.add(id, { id = t.id; schoolId = t.schoolId; name = t.name; isActive = false });
          };
        };
        // Reset all scores for this school on term activation
        for ((id, score) in scores.entries()) {
          switch (students.get(score.studentId)) {
            case (?student) {
              if (student.schoolId == term.schoolId) { scores.remove(id) };
            };
            case (null) {};
          };
        };
        terms.add(termId, { id = term.id; schoolId = term.schoolId; name = term.name; isActive = true });
      };
    };
  };

  public query ({ caller }) func getTerm(id : Nat) : async ?Term {
    switch (terms.get(id)) {
      case (?term) {
        if (not (isSchoolAdmin(caller, term.schoolId) or isTeacher(caller, term.schoolId))) { Runtime.trap("Unauthorized") };
        ?term;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listTerms(schoolId : Nat) : async [Term] {
    if (not (isSchoolAdmin(caller, schoolId) or isTeacher(caller, schoolId))) { Runtime.trap("Unauthorized") };
    terms.values().toArray().filter(func(t) { t.schoolId == schoolId });
  };

  // ── Scores ───────────────────────────────────────────────────────────────────
  func calcGrade(total : Nat) : Text {
    if (total >= 70) { "A" } else if (total >= 60) { "B" } else if (total >= 50) { "C" } else if (total >= 45) { "D" } else if (total >= 40) { "E" } else { "F" };
  };

  public shared ({ caller }) func enterScore(studentId : Nat, subjectId : Nat, teacherId : Nat, sessionId : Nat, termId : Nat, ca1 : Nat, ca2 : Nat, exam : Nat) : async Nat {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.userType) {
          case (#teacher) {
            if (profile.userId != teacherId) { Runtime.trap("Unauthorized: Teacher ID mismatch") };
          };
          case (_) { Runtime.trap("Unauthorized: Only teachers can enter scores") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };
    switch (subjects.get(subjectId)) {
      case (?subject) {
        switch (subject.teacherId) {
          case (?tid) {
            if (tid != teacherId) { Runtime.trap("Unauthorized: Not assigned to this subject") };
          };
          case (null) { Runtime.trap("No teacher assigned to this subject") };
        };
        switch (students.get(studentId)) {
          case (?student) {
            if (student.schoolId != subject.schoolId) { Runtime.trap("School mismatch") };
          };
          case (null) { Runtime.trap("Student not found") };
        };
      };
      case (null) { Runtime.trap("Subject not found") };
    };
    if (ca1 > 20 or ca2 > 20 or exam > 60) { Runtime.trap("Invalid score range") };
    let total = ca1 + ca2 + exam;
    let grade = calcGrade(total);
    let id = nextScoreId;
    nextScoreId += 1;
    scores.add(id, { id; studentId; subjectId; teacherId; sessionId; termId; ca1; ca2; exam; total; grade });
    id;
  };

  public query ({ caller }) func getScore(id : Nat) : async ?Score {
    switch (scores.get(id)) {
      case (?score) {
        switch (students.get(score.studentId)) {
          case (?student) {
            if (not (isSchoolAdmin(caller, student.schoolId) or isTeacher(caller, student.schoolId) or isStudent(caller, score.studentId))) { Runtime.trap("Unauthorized") };
            ?score;
          };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getStudentScores(studentId : Nat) : async [Score] {
    switch (students.get(studentId)) {
      case (?student) {
        if (not (isSchoolAdmin(caller, student.schoolId) or isTeacher(caller, student.schoolId) or isStudent(caller, studentId))) {
          Runtime.trap("Unauthorized");
        };
      };
      case (null) { Runtime.trap("Student not found") };
    };
    scores.values().toArray().filter(func(s) { s.studentId == studentId });
  };
};
