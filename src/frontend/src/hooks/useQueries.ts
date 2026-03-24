import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Class,
  School,
  Score,
  Session,
  Student,
  Subject,
  Teacher,
  Term,
} from "../backend.d";
import { useActor } from "./useActor";

export function useListSchools() {
  const { actor, isFetching } = useActor();
  return useQuery<School[]>({
    queryKey: ["schools"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllSchools();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchTeachers(schoolId: string, query = "") {
  const { actor, isFetching } = useActor();
  return useQuery<Teacher[]>({
    queryKey: ["teachers", schoolId, query],
    queryFn: async () => {
      if (!actor || !schoolId) return [];
      return actor.searchTeachersByName(BigInt(schoolId), query);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useSearchStudents(schoolId: string, query = "") {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students", schoolId, query],
    queryFn: async () => {
      if (!actor || !schoolId) return [];
      return actor.searchStudentsByName(BigInt(schoolId), query);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useSearchClasses(schoolId: string, query = "") {
  const { actor, isFetching } = useActor();
  return useQuery<Class[]>({
    queryKey: ["classes", schoolId, query],
    queryFn: async () => {
      if (!actor || !schoolId) return [];
      return actor.searchClassesByName(BigInt(schoolId), query);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useSearchSubjects(schoolId: string, query = "") {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects", schoolId, query],
    queryFn: async () => {
      if (!actor || !schoolId) return [];
      return actor.searchSubjectsByName(BigInt(schoolId), query);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useSchool(schoolId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<School | null>({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      if (!actor || !schoolId) return null;
      return actor.getSchool(BigInt(schoolId));
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useGetSessions(schoolId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessions", schoolId],
    queryFn: async () => {
      if (!actor || !schoolId) return [];
      // No list endpoint - return empty, manage locally
      return [];
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useGetTerms(schoolId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Term[]>({
    queryKey: ["terms", schoolId],
    queryFn: async () => {
      if (!actor || !schoolId) return [];
      return [];
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useStudentScores(studentId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Score[]>({
    queryKey: ["scores", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentScores(BigInt(studentId));
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export { useQueryClient };
