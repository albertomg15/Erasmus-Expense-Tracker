import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [sessionExpired, setSessionExpired] = useState(false); // ✅ añadido

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  useEffect(() => {
  if (sessionStorage.getItem("sessionExpired") === "true") {
    setSessionExpired(true);
    sessionStorage.removeItem("sessionExpired");
  }
    }, []);

  const login = (jwt) => {
    sessionStorage.setItem("token", jwt);
    setToken(jwt);
  };

  
  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setSessionExpired(true);

  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        logout,
        sessionExpired,
        setSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
