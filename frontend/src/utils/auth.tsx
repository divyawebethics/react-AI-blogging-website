import {createContext, useState, useEffect} from "react";

interface UserType {
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserType | null;
  login: (token: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('access_token');
  
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getTokenPayload = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
};

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const logout = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const payload = getTokenPayload();
    if (payload && isTokenValid()) {
      console.log("Decoded payload:", payload);
      setUser({ email: payload.sub, role: payload.role || "user" });
    } else {
      setUser(null);
    }
  }, []);



  const login = (token: string) => {
  if (!token) return;
  const payload = JSON.parse(atob(token.split(".")[1]));
  if (!payload || !payload.sub) return;
  setUser({ email: payload.sub, role: payload.role || "user" });
  localStorage.setItem("access_token", token);
};

  const logoutUser = () => {
    setUser(null);
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};