import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("add-profile")
  .setDescription("Add league profile for assistant to track");

const execute = async (interaction) => {
  await interaction.reply("command executed");
};

const command = {
  data: data,
  execute: execute,
};

export default command;
