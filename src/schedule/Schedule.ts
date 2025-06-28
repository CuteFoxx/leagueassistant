import Database from "better-sqlite3";
import schedule from "node-schedule";
import RiotApi from "../APIs/RiotApi.ts";
import type { User } from "../interfaces/User.ts";
import type { MatchData } from "../interfaces/MatchData.ts";
import { Gemini } from "../APIs/Gemini.ts";
import { EventEmitter } from "node:events";
import CustomClient from "../CustomClient.ts";
import eventEmitter from "../Events/EventEmitter.ts";

export const RUN_EVERY = 1;
export const MS_PER_MINUTE = 60000;

async function Schedule(client: CustomClient) {
  //time how ofter should cron be ran in mins

  schedule.scheduleJob(`*/${RUN_EVERY} * * * *`, () => {
    const db = new Database("app.db");
    db.pragma("journal_mode = WAL");
    const rows = db
      .prepare("SELECT * FROM users WHERE puuid IS NOT NULL")
      .all();

    rows.forEach(async (row) => {
      eventEmitter.emit("processUserMatch", row, client);
    });

    db.close();
  });
}

export default Schedule;
