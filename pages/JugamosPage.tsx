import { useEffect } from "react";

export default function JugamosPage() {
  useEffect(() => {
    window.open(
      "/CuadernoVivo_Hub.html",
      "_blank",
      "noopener,noreferrer"
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white/70 text-sm">
      🎮 Abriendo modo juego...
    </div>
  );
}
