import { Gemini } from "../APIs/Gemini.ts";
import RiotApi from "../APIs/RiotApi.ts";
import CustomClient from "../CustomClient.ts";
import type { MatchData } from "../interfaces/MatchData.ts";
import type { User } from "../interfaces/User.ts";
import { MS_PER_MINUTE, RUN_EVERY } from "../schedule/Schedule.ts";

export default async function ProcessUserMatch(
  row: User,
  client: CustomClient
) {
  const riotApi = client.getRiotApi();
  const now = Date.now();
  const endTime = new Date(now + RUN_EVERY * MS_PER_MINUTE).getTime();
  const startTime = new Date(now - RUN_EVERY * MS_PER_MINUTE).getTime();
  const db = client.getDatabase();

  const recentMatch = await riotApi
    ?.getMatchHistory(row.puuid)
    .then((data) => data);

  const matchData: MatchData | null = await riotApi
    .getMatchData(
      (Array.isArray(recentMatch) ? recentMatch[0] : recentMatch) ?? ""
    )
    .then((data) => data);

  if (!matchData) {
    return;
  }

  if (new Date(matchData["info"]["gameEndTimestamp"]).getTime() >= startTime) {
    const participants = matchData["info"].participants;
    const matchup = RiotApi.getMatchup(row.puuid, participants);
    const gemini = new Gemini(process.env.GEMINI_API ?? "");

    setTimeout(async () => {
      const res = await gemini.getVideoAboutMatchup(matchup);

      const channelObj = db
        .prepare("SELECT * FROM botSettings WHERE channel IS NOT NULL")
        .get();

      client?.channels?.cache
        ?.get(channelObj.channel)
        ?.send(
          `<@${row.addedBy}> : ${row.ign} \n ${res["candidates"][0].content.parts[0].text}`
        );
    }, 1000);
  }
}
