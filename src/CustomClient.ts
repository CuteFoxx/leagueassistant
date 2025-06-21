import { Client, Collection } from "discord.js";
import type { ClientOptions } from "discord.js";
import type { Command } from "./interfaces/Command";

class CustomClient extends Client {
  public commands: Collection<string, Command>;

  public constructor(
    options: ClientOptions,
    commands: Collection<string, Command>
  ) {
    super(options);
    this.commands = commands;
  }

  public getCommands(): Collection<string, Command> {
    return this.commands;
  }
}

export default CustomClient;
