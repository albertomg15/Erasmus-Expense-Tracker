import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "../services/config";
import i18n from "../i18n";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  useEffect(() => {
    setIsAuthenticated(!!token);
    if (token) fetchUser(); // Carga el usuario al inicio si hay token
  }, [token]);

  useEffect(() => {
    if (sessionStorage.getItem("sessionExpired") === "true") {
      setSessionExpired(true);
      sessionStorage.removeItem("sessionExpired");
    }
  }, []);

  const detectBrowserLang = () => {
  const nav = (navigator.language || "en").toLowerCase();
   if (nav.startsWith("es")) return "es";
   if (nav.startsWith("fr")) return "fr";
   if (nav.startsWith("pl")) return "pl";
   if (nav.startsWith("ca") || nav.startsWith("val")) return "vl";
   return "en";
 };

  const login = async (jwt) => {
    sessionStorage.setItem("token", jwt);
    setToken(jwt);
    await fetchUser(); // Carga el usuario tras login
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setSessionExpired(true);
    localStorage.removeItem("i18nextLng"); // no arrastrar idioma del usuario anterior
    i18n.changeLanguage(detectBrowserLang());
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        user,
        setUser,
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
