import { useState, useEffect } from "react";
import { login as loginService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login, sessionExpired, setSessionExpired } = useAuth();

  // Mostrar mensaje si la sesión ha expirado
  useEffect(() => {
    if (sessionExpired) {
      toast.error("Your session has expired. Please log in again.");
       setSessionExpired(false);
    }
  }, [sessionExpired]);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 1) {
      toast.error("Password cannot be empty.");
      return;
    }

    try {
      const data = await loginService({ email, password });
      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#E6F0FA] flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#0056B3] mb-8">
        Welcome Back
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl px-8 py-6 w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email address
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
            Password
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

        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#0056B3] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Log In
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        Don't have an account?{" "}
        <a href="/register" className="text-[#0056B3] underline">
          Register
        </a>
      </p>
    </div>
  );
}
