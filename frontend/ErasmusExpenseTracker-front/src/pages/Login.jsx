import { useState, useEffect } from "react";
import { login as loginService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { getUserInfo } from "../services/userService";

export default function Login() {
  const normalizeLang = (lng) => {
  const m = String(lng || "").toLowerCase();
  if (m.startsWith("es")) return "es";
  if (m.startsWith("en")) return "en";
  if (m.startsWith("fr")) return "fr";
  if (m.startsWith("pl")) return "pl";
  if (m.startsWith("ca") || m.startsWith("val") || m === "vl") return "vl";
  return "en";
};

const { t, i18n } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, sessionExpired, setSessionExpired } = useAuth();

  useEffect(() => {
    if (sessionExpired) {
      toast.error(t("sessionExpired"));
      setSessionExpired(false);
    }
  }, [sessionExpired, t]);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      toast.error(t("invalidEmail"));
      return;
    }

    if (password.length < 1) {
      toast.error(t("emptyPassword"));
      return;
    }

    try {
      const data = await loginService({ email, password });
      login(data.token);
      try {
        const me = await getUserInfo();
        const lang = normalizeLang(me?.language);
        i18n.changeLanguage(lang);
        localStorage.setItem("i18nextLng", lang);
      } catch (e) {
        console.error("No se pudo ajustar el idioma por usuario", e);
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(t("invalidCredentials"));
    }
  };

  return (
    <div className="min-h-screen bg-[#E6F0FA] flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#0056B3] mb-8">
        {t("welcomeBack")}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl px-8 py-6 w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            {t("email")}
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            {t("password")}
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        <button
          type="submit"
          className="w-full bg-[#0056B3] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          {t("login")}
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        {t("noAccount")}{" "}
        <a href="/register" className="text-[#0056B3] underline">
          {t("register")}
        </a>
      </p>

      {/* Texto LOPD más abajo */}
      <div className="mt-20 text-sm text-gray-700">
        {t("lopdNotice")}{" "}
        <a
          href="mailto:amelgar1@etsinf.upv.es "
          className="text-[#0056B3] underline"
        >
         amelgar1@etsinf.upv.es 
                  </a>
      </div>
    </div>
  );
}
