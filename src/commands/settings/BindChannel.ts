import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import CustomClient from "../../CustomClient.ts";

const data = new SlashCommandBuilder()
  .setName("bind-channel")
  .setDescription("Bot notifications will be send to this channel");

const execute = async (interaction: ChatInputCommandInteraction) => {
  const client = interaction.client as CustomClient;
  const db = client.getDatabase();
  const channelId = interaction.channelId;

  const stmt = db?.prepare("SELECT channel FROM botSettings WHERE channel = ?");
  const result = stmt?.get(channelId);

  if (result) {
    await sendReply(interaction, "Channel already binded");
    return;
  } else {
    const query = db?.prepare("INSERT INTO botSettings (channel) VALUES (?)");
    query?.run(channelId);

    await sendReply(interaction, "Channel binded");
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
