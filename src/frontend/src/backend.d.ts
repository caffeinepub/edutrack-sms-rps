import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Class {
    id: bigint;
    arm: string;
    schoolId: bigint;
    classLevel: string;
    className: string;
}
export interface Session {
    id: bigint;
    name: string;
    isActive: boolean;
    schoolId: bigint;
}
export interface Term {
    id: bigint;
    name: string;
    isActive: boolean;
    schoolId: bigint;
}
export interface Score {
    id: bigint;
    ca1: bigint;
    ca2: bigint;
    total: bigint;
    studentId: bigint;
    exam: bigint;
    grade: string;
    subjectId: bigint;
    teacherId: bigint;
    sessionId: bigint;
    termId: bigint;
}
export interface School {
    id: bigint;
    isApproved: boolean;
    username: string;
    password: string;
    name: string;
    email: string;
    address: string;
    phone: string;
}
export interface SchoolBranding {
    schoolId: bigint;
    motto: string;
    websiteUrl: string;
    logoBase64: string;
    stampBase64: string;
    signatureBase64: string;
}
export interface Teacher {
    id: bigint;
    username: string;
    password: string;
    fullName: string;
    email: string;
    schoolId: bigint;
    address: string;
    phone: string;
}
export interface Subject {
    id: bigint;
    code: string;
    name: string;
    assignedClasses: Array<bigint>;
    schoolId: bigint;
    teacherId?: bigint;
}
export interface UserProfile {
    userType: UserType;
    userId: bigint;
    schoolId?: bigint;
}
export interface Student {
    id: bigint;
    password: string;
    parentPhone: string;
    fullName: string;
    classId: bigint;
    admissionNumber: string;
    schoolId: bigint;
    gender: string;
    parentName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserType {
    teacher = "teacher",
    superAdmin = "superAdmin",
    schoolAdmin = "schoolAdmin",
    student = "student"
}
export interface backendInterface {
    activateSession(sessionId: bigint): Promise<void>;
    activateTerm(termId: bigint): Promise<void>;
    addClass(schoolId: bigint, classLevel: string, className: string, arm: string): Promise<bigint>;
    addSession(schoolId: bigint, name: string): Promise<bigint>;
    addStudent(schoolId: bigint, fullName: string, gender: string, classId: bigint, admissionNumber: string, parentName: string, parentPhone: string, password: string): Promise<bigint>;
    addSubject(schoolId: bigint, name: string, code: string, assignedClasses: Array<bigint>, teacherId: bigint | null): Promise<bigint>;
    addTeacher(schoolId: bigint, fullName: string, username: string, phone: string, email: string, address: string, password: string): Promise<bigint>;
    addTerm(schoolId: bigint, name: string): Promise<bigint>;
    approveSchool(schoolId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteClass(classId: bigint): Promise<void>;
    deleteStudent(studentId: bigint): Promise<void>;
    deleteSubject(subjectId: bigint): Promise<void>;
    deleteTeacher(teacherId: bigint): Promise<void>;
    enterScore(studentId: bigint, subjectId: bigint, teacherId: bigint, sessionId: bigint, termId: bigint, ca1: bigint, ca2: bigint, exam: bigint): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClass(id: bigint): Promise<Class | null>;
    getSchool(id: bigint): Promise<School | null>;
    getSchoolBranding(schoolId: bigint): Promise<SchoolBranding | null>;
    getSchoolSelf(): Promise<School | null>;
    getScore(id: bigint): Promise<Score | null>;
    getSession(id: bigint): Promise<Session | null>;
    getStudent(id: bigint): Promise<Student | null>;
    getStudentScores(studentId: bigint): Promise<Array<Score>>;
    getStudentSelf(): Promise<Student | null>;
    getSubject(id: bigint): Promise<Subject | null>;
    getTeacher(id: bigint): Promise<Teacher | null>;
    getTeacherSelf(): Promise<Teacher | null>;
    getTerm(id: bigint): Promise<Term | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllSchools(): Promise<Array<School>>;
    listClasses(schoolId: bigint): Promise<Array<Class>>;
    listSessions(schoolId: bigint): Promise<Array<Session>>;
    listStudents(schoolId: bigint): Promise<Array<Student>>;
    listSubjects(schoolId: bigint): Promise<Array<Subject>>;
    listTeachers(schoolId: bigint): Promise<Array<Teacher>>;
    listTerms(schoolId: bigint): Promise<Array<Term>>;
    loginSchoolAdmin(username: string, password: string): Promise<bigint | null>;
    loginStudent(admissionNumber: string, password: string): Promise<bigint | null>;
    loginSuperAdmin(email: string, password: string): Promise<boolean>;
    loginTeacher(username: string, password: string): Promise<bigint | null>;
    registerSchool(name: string, email: string, phone: string, address: string, username: string, password: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchClassesByName(schoolId: bigint, name: string): Promise<Array<Class>>;
    searchStudentsByName(schoolId: bigint, name: string): Promise<Array<Student>>;
    searchSubjectsByName(schoolId: bigint, name: string): Promise<Array<Subject>>;
    searchTeachersByName(schoolId: bigint, name: string): Promise<Array<Teacher>>;
    updateClass(classId: bigint, classLevel: string, className: string, arm: string): Promise<void>;
    updateSchoolBranding(schoolId: bigint, motto: string, websiteUrl: string, logoBase64: string, stampBase64: string, signatureBase64: string): Promise<void>;
    updateStudent(studentId: bigint, fullName: string, gender: string, classId: bigint, admissionNumber: string, parentName: string, parentPhone: string): Promise<void>;
    updateSubject(subjectId: bigint, name: string, code: string, assignedClasses: Array<bigint>, teacherId: bigint | null): Promise<void>;
    updateTeacher(teacherId: bigint, fullName: string, username: string, phone: string, email: string, address: string): Promise<void>;
}
