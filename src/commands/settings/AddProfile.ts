import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import CustomClient from "../../CustomClient.ts";
import { AxiosError } from "axios";

const data = new SlashCommandBuilder()
  .setName("add-profile")
  .setDescription("Add league profile for assistant to track")
  .addStringOption((option) =>
    option
      .setName("ign")
      .setDescription("Enter your ign with tag like Name#EUW")
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const client = interaction.client as CustomClient;
  const db = client.getDatabase();
  const riotApi = client.getRiotApi();
  const regex = /^.{3,}#.{3,}$/i;
  const ign = interaction.options.getString("ign") ?? "";

  if (!regex.test(ign)) {
    await sendReply(interaction, "Invalid ign");

    return;
  }

  const [name, tag] = ign.split("#");
  const res = await riotApi?.getAccountByRiotId(name, tag);

  if (res instanceof AxiosError) {
    if (res.status == 404) {
      await sendReply(interaction, "Account not found!");
      return;
    } else {
      await sendReply(interaction, res.message);
    }
    return;
  }

  const stmt = db?.prepare(
    "SELECT ign FROM users WHERE ign = ? AND addedBy = ?"
  );
  const result = stmt?.get(ign, interaction.member?.user.id);

  // MAKE some global var for table name idk
  if (result) {
    await sendReply(interaction, "This account already added");
  } else {
    const stmt = db?.prepare(
      "INSERT INTO users (ign, addedBy, puuid) VALUES (?, ?, ?)"
    );
    stmt?.run(ign, interaction?.member?.user.id, res.puuid);

    await sendReply(interaction, "Account added successfully");
  }
};

const command = {
  data: data,
  execute: execute,
};

export default command;

async function sendReply(
  interaction: ChatInputCommandInteraction,
  text: string
) {
  await interaction.reply({
    content: text,
    flags: MessageFlags.Ephemeral,
  });
}
