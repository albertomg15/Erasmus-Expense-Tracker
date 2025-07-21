import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E6F0FA] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold text-[#0056B3] mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">
        Página no encontrada.
      </p>
      <Link
        to="/"
        className="bg-[#0056B3] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
