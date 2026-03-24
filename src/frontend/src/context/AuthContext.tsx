import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export type UserRole = "superAdmin" | "schoolAdmin" | "teacher" | "student";

interface AuthState {
  role: UserRole | null;
  userId: string | null;
  schoolId: string | null;
  displayName: string | null;
}

interface AuthContextType extends AuthState {
  login: (state: AuthState) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "edutrack_auth";

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { role: null, userId: null, schoolId: null, displayName: null };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadFromStorage);

  const login = useCallback((newState: AuthState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const logout = useCallback(() => {
    const empty = {
      role: null,
      userId: null,
      schoolId: null,
      displayName: null,
    };
    setState(empty);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, isAuthenticated: !!state.role }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
