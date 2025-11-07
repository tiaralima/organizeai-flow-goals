import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0f1a] via-[#141325] to-[#0b0f1a]">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">Oops! Página não encontrada</p>
        <a href="/" className="underline">
          Voltar para Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
