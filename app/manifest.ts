import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Perfil de Desempenho",
    short_name: "Perfil",
    description: "Departamento de Psicologia — perfis psicológico, técnico-tático, scouting e escolar.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfdfb",
    theme_color: "#2d6a4f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
