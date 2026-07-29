import type { NextConfig } from "next";

// Legacy URLs from before the app had multiple areas (Psicológico/Técnico-Tático).
// Everything used to live at the root; it's now nested under /psychological/*.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/teams/:teamId/athletes/:athleteId",
        destination: "/psychological/teams/:teamId/athletes/:athleteId",
        permanent: false,
      },
      {
        source: "/teams/:teamId",
        destination: "/psychological/teams/:teamId",
        permanent: false,
      },
      { source: "/teams", destination: "/psychological/teams", permanent: false },
      { source: "/competencies", destination: "/psychological/competencies", permanent: false },
      { source: "/legend", destination: "/psychological/legend", permanent: false },
      { source: "/compare", destination: "/psychological/compare", permanent: false },
      {
        source: "/print/athlete/:athleteId",
        destination: "/print/psychological/athlete/:athleteId",
        permanent: false,
      },
      {
        source: "/print/team/:teamId",
        destination: "/print/psychological/team/:teamId",
        permanent: false,
      },
      {
        source: "/print/compare",
        destination: "/print/psychological/compare",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
