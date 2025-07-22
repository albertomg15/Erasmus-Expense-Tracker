import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#E6F0FA] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl sm:text-5xl font-bold text-[#0056B3] mb-12">
        Erasmus Expense Tracker
      </h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          to="/login"
          className="bg-[#0056B3] text-white px-8 py-4 rounded-xl text-lg hover:bg-blue-700 transition"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="bg-white text-[#0056B3] px-8 py-4 rounded-xl text-lg border border-[#0056B3] hover:bg-[#f0f7ff] transition"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
