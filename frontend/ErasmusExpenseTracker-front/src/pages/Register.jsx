import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("EUR");
  const [language, setLanguage] = useState("en");
  //const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Submit triggered");

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== repeatPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await register({ email, password, preferredCurrency, language });
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#E6F0FA] flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#0056B3] mb-8">
        Create an Account
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
            minLength={6}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="repeatPassword">
            Repeat Password
          </label>
          <input
            type="password"
            id="repeatPassword"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="preferredCurrency">
            Preferred Currency
          </label>
          <input
            type="text"
            id="preferredCurrency"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={preferredCurrency}
            onChange={(e) => setPreferredCurrency(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="language">
            Language
          </label>
          <input
            type="text"
            id="language"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          />
        </div>


        <button
          type="submit"
          className="w-full bg-[#0056B3] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-[#0056B3] underline">
          Log in
        </a>
      </p>
    </div>
  );
}
