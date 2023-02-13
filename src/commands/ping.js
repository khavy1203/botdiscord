import axios from "../setup/axios";
import db from '../models/index.js'
import discordServices from "../services/discordServices";
import constant from "../constant/constant";
const { SlashCommandBuilder } = require('discord.js');
const lstChanel = [constant.DAILY];
const lstGuild = ["abc", "def"];
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply("Get daily success")
	},
};