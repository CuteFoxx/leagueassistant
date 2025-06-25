import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import CustomClient from "../../CustomClient.ts";
import { AxiosError } from "axios";

const data = new SlashCommandBuilder()
  .setName("remove-profile")
  .setDescription("Remove league profile from assistant")
  .addStringOption((option) =>
    option
      .setName("ign")
      .setDescription("Enter your ign with tag like Name#EUW")
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const client = interaction.client as CustomClient;
  const db = client.getDatabase();

  const regex = /^.{3,}#.{3,}$/i;
  const ign = interaction.options.getString("ign") ?? "";

  if (!regex.test(ign)) {
    await sendReply(interaction, "Invalid ign");

    return;
  }

  const stmt = db?.prepare(
    "SELECT ign FROM users WHERE ign = ? AND addedBy = ?"
  );
  const result = stmt?.get(ign, interaction.member?.user.id);

  // MAKE some global var for table name idk
  if (result) {
    const TBD = db?.prepare("DELETE FROM users WHERE ign = ? AND addedBy = ?");
    TBD?.run(ign, interaction.member?.user.id);
    await sendReply(interaction, "Account deleted");
  } else {
    await sendReply(interaction, "You haven't tracked this account");
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
