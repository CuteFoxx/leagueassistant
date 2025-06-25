import axios from "axios";
import type { MatchData, Participants } from "../interfaces/MatchData";
import type { Matchup } from "../interfaces/Matchup";

class RiotApi {
  private apiKey: string;

  private server: string = "EUW";

  private baseAccountsUrl =
    "https://europe.api.riotgames.com/riot/account/v1/accounts";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getAccountByRiotId(name: string, tag: string) {
    try {
      const res = await axios.get(
        `${this.baseAccountsUrl}/by-riot-id/${name}/${tag}?api_key=${this.apiKey}`
      );

      return res.data;
    } catch (e) {
      return e;
    }
  }

  public async getMatchHistory(puuid: string, count: number = 1) {
    const baseUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    let result: string[] | string = [];

    await axios
      .get(baseUrl, {
        headers: {
          "X-Riot-Token": this.apiKey,
        },
      })
      .then((res) => (result = res.data))
      .catch((err) => console.error(err));

    return result;
  }

  public async getMatchData(matchId: string) {
    let result: MatchData | null = null;
    const baseUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`;

    await axios
      .get(baseUrl, {
        headers: {
          "X-Riot-Token": this.apiKey,
        },
      })
      .then((res) => (result = res.data))
      .catch((err) => console.error(err));

    return result;
  }

  public static getMatchup(
    puuid: string,
    participants: Participants[]
  ): Matchup {
    const user: Participants = participants.filter(
      (item) => item.puuid === puuid
    )[0];
    const [userRole, userChampion] = [user.teamPosition, user.championName];

    const opponent = participants.filter((item) => {
      return item.teamPosition === userRole && item.puuid != puuid;
    })[0];
    // console.log("oponenet", opponent);

    const [opponentRole, opponentChampion] = [
      opponent?.teamPosition,
      opponent?.championName,
    ];

    return {
      user: {
        role: userRole,
        champion: userChampion,
      },
      opponent: {
        role: opponentRole,
        champion: opponentChampion,
      },
    };
  }
}

export default RiotApi;
