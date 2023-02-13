import axios from "../setup/axios";
// import db from '../models/index.js';
import constant from "../constant/constant";
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		// const countUser = await db.users.count({ col: 'userId'}) ;
		// await interaction.reply(`Số lượng User Update trong hệ thống : ${countUser} users.`);
		
		await interaction.reply(`Dữ liệu đang được update lên Icloud`);
		
	},
};