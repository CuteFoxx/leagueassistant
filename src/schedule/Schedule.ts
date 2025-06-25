import Database from "better-sqlite3";
import schedule from "node-schedule";
import RiotApi from "../APIs/RiotApi.ts";
import type { User } from "../interfaces/User.ts";
import type { MatchData } from "../interfaces/MatchData.ts";
import { Gemini } from "../APIs/Gemini.ts";

async function Schedule(riotApi: RiotApi) {
  //time how ofter should cron be ran in mins
  const RUN_EVERY = 1;
  const MS_PER_MINUTE = 60000;

  schedule.scheduleJob(`*/${RUN_EVERY} * * * *`, () => {
    const db = new Database("app.db");
    db.pragma("journal_mode = WAL");
    const rows = db
      .prepare("SELECT * FROM users WHERE puuid IS NOT NULL")
      .all();

    rows.forEach(async (row) => {
      const data = row as User;
      const now = Date.now();
      const endTime = new Date(now + RUN_EVERY * MS_PER_MINUTE).getTime();
      const startTime = new Date(now - RUN_EVERY * MS_PER_MINUTE).getTime();
      const recentMatch = await riotApi
        .getMatchHistory(data.puuid)
        .then((data) => data);

      const matchData: MatchData | null = await riotApi
        .getMatchData(Array.isArray(recentMatch) ? recentMatch[0] : recentMatch)
        .then((data) => data);

      if (!matchData) {
        return;
      }
      await console.log(
        `recent match of ${data.ign}: ${recentMatch} end time of match ${matchData["info"]["gameEndTimestamp"]}`
      );

      if (
        new Date(matchData["info"]["gameEndTimestamp"]).getTime() >= startTime
      ) {
        console.log("process this match");
      }

      const participants = matchData["info"].participants;
      const matchup = RiotApi.getMatchup(data.puuid, participants);
      const gemini = new Gemini(process.env.GEMINI_API ?? "");
      const res = await gemini.getVideoAboutMatchup(matchup);
      console.log(res["candidates"][0].content.parts[0].text);
    });

    db.close();
  });
}

export default Schedule;
