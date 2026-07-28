export type ScoreMap = Record<string, number>;

export type CompetencyDTO = {
  id: string;
  name: string;
  description: string;
  position: number;
};

export type CompetencyInput = {
  name: string;
  description: string;
};

export type AthleteDTO = {
  id: string;
  teamId: string;
  name: string;
  scores: ScoreMap;
};

export type TeamSummaryDTO = {
  id: string;
  name: string;
  athleteCount: number;
};

export type CompetencyStatsDTO = {
  competencyId: string;
  name: string;
  avg: number;
  min: number;
  max: number;
};

export type TeamDetailDTO = {
  id: string;
  name: string;
  athletes: AthleteDTO[];
  stats: CompetencyStatsDTO[];
};

export type TeamAverageSeriesDTO = {
  teamId: string;
  teamName: string;
  averages: ScoreMap;
};
