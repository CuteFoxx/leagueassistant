import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import CustomClient from "./CustomClient.ts";
import type { Command } from "./interfaces/Command.ts";
import { fileURLToPath } from "node:url";
import initDB from "./database/InitDB.ts";
import RiotApi from "./APIs/RiotApi.ts";
import Schedule from "./schedule/Schedule.ts";
import EventListener from "./Events/EventListener.ts";

(async () => {
  const commands = new Collection<string, Command>();
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename);
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  const db = await initDB();
  const riotApi = new RiotApi(process.env.RIOT_API ?? "");

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts"));
    for await (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      let command = await import(`file://${filePath}`);
      command = command.default;

      if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const client = new CustomClient(
    { intents: [GatewayIntentBits.Guilds] },
    commands,
    db,
    riotApi
  );

  Schedule(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    // LISTEN TO EVENTS
    EventListener();
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as CustomClient;
    const command = client.getCommands().get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  });

  await client.login(process.env.BOT_API_KEY);
})();
