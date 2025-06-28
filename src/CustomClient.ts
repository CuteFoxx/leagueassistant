import { Client, Collection } from "discord.js";
import type { ClientOptions } from "discord.js";
import type { Command } from "./interfaces/Command";
import type { Database } from "better-sqlite3";
import RiotApi from "./APIs/RiotApi.ts";

class CustomClient extends Client {
  public commands: Collection<string, Command>;

  public db: Database;

  public riotApi: RiotApi;

  public constructor(
    options: ClientOptions,
    commands: Collection<string, Command>,
    db: Database,
    riotApi: RiotApi
  ) {
    super(options);
    this.commands = commands;
    this.db = db;
    this.riotApi = riotApi;
  }

  public getCommands(): Collection<string, Command> {
    return this.commands;
  }

  public getDatabase(): Database {
    return this.db;
  }

  public setDatabase(db: Database): CustomClient {
    this.db = db;
    return this;
  }

  public getRiotApi(): RiotApi {
    return this.riotApi;
  }

  public setRiotApi(riotApi: RiotApi): CustomClient {
    this.riotApi = riotApi;
    return this;
  }
}

export default CustomClient;
