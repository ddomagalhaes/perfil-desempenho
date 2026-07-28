export type ScoreMap = Record<string, number>;

export type CompetencyDTO = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type CompetencyInput = {
  name: string;
  description: string;
};

export type PositionDTO = {
  id: string;
  name: string;
  sortOrder: number;
};

export type AthleteDTO = {
  id: string;
  teamId: string;
  name: string;
  positionId: string | null;
  positionName: string | null;
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

export type PositionGroupDTO = {
  position: PositionDTO | null; // null = athletes with no position assigned yet
  athletes: AthleteDTO[];
  stats: CompetencyStatsDTO[];
  competencies: CompetencyDTO[];
};
