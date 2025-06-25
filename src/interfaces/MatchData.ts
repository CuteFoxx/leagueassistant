export interface MatchData {
  info: {
    gameEndTimestamp: string;
    participants: Participants[];
  };
}

export interface Participants {
  role: string;
  teamPosition: string;
  championName: string;
  puuid: string;
}
