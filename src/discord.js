require('dotenv').config();
import apiRouter from "./routes/api";
import constant, { CHANEL_BOT } from "./constant/constant";
import discordServices from "./services/discordServices";
import util from "./util/caseMessage";
import db from "./models";
import { Configuration, OpenAIApi } from "openai";
import firebase from "./config/firebase";
import { saveUser, saveMassageDaily } from "./utils/firestore";
import { AsciiTable3, AlignmentEnum } from 'ascii-table3';
import WebSocket, { WebSocketServer } from 'ws';

const cron = require('node-cron');
const path = require('path');
const fs = require('node:fs');
const Discord = require("discord.js");

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const configuration = new Configuration({
	apiKey: process.env.OPEN_API_KEY
})

const openai = new OpenAIApi(configuration);
const rest = new Discord.REST({ version: "10" }).setToken(
	process.env.TOKEN_DISCORD
);

const botDiscord = async (app) => {
	let lstGuilds = [];
	(async () => {
		try {
			console.log("Started refreshing Discord application (/) commands.")

			await rest.put(Discord.Routes.applicationCommands(process.env.DISCORD_BOT_ID), {
				body: [
					{
						name: "ping",
						description: "Kiểm tra tốc độ hiện tại kết nối với serve."
					},
					{
						name: "register-chanel-daily",
						description: "Đăng ký chanal để nhắc nhở trong daily",
					},
					{
						name: "list-user-register",
						description: "Kiểm tra thông tin của User bao gồm các kênh daily .v.v. ."
					},
					{
						name: "turn-off-remind-daily",
						description: "Tắt nhắc daily hàng ngày"
					},
					{
						name: "turn-on-remind-daily",
						description: "Bật nhắc daily hàng ngày"
					},
					{
						name: "generate-image",
						description: "Hiển thị ra hình ảnh từ câu trả lời mô tả của bạn.",
						options: [
							{
								name: "prompt",
								description: "Câu trả lời mô tả về hình ảnh của bạn.",
								type: 3,
								required: true
							}
						]
					},
					{
						name: "chat",
						description: "Generates a text response based on a provided prompt using your chosen OpenAI model.",
						options: [
							{
								name: "prompt",
								description: "Absolutely anything.",
								type: 3,
								required: true
							}
						]
					}
				]
			})
			console.log("Successfully reloaded Discord application (/) commands.")
		} catch (err) {
			console.error(err)
		}
	})()

	apiRouter(app);
	const lstGuild = [];
	const lstChanel = [constant.NCC_CHANEL, constant.OUT_CHANEL, constant.DAILY];
	const client = new Discord.Client({
		partials: [
			Discord.Partials.Channel,
			Discord.Partials.Message
		],
		intents: [
			Discord.GatewayIntentBits.DirectMessages,
			Discord.GatewayIntentBits.DirectMessageTyping,
			Discord.GatewayIntentBits.Guilds,
			Discord.GatewayIntentBits.GuildMessages,
			Discord.GatewayIntentBits.MessageContent,
			Discord.GatewayIntentBits.GuildMembers
		]
	})

	async function remindDailySendMessage() {
		const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'));
		const pr1 = database.chanelRemind?.map(async chanelRemind => {
			const lsMessages = await discordServices.getMessageById(chanelRemind.chanelId, chanelRemind.authorization)
			const currentDate = new Date();
			if (lsMessages && lsMessages.status === 0) {
				lsMessages?.data?.map(async (message) => {
					if (message.timestamp && (new Date(message.timestamp)).getDate() == currentDate.getDate()) {
						const messageFind = database.messageEveryday.find(x => x.chanelId == chanelRemind.chanelId)?.data.find(userMessage => userMessage?.userId === message?.author?.id);
						if (messageFind && messageFind != 'undefined') {
							if (messageFind?.content.length) {
								if (!messageFind.content.some(content => content.contentId == message.id)) {
									console.log('check ', !messageFind.content.some(content => content.contentId == message.id))
									messageFind.content.push(
										{
											"contentId": message.id,
											"createdTimestamp": message.timestamp,
											"content": message.content
										}
									);
								}
							}
						} else {
							const changeMessage = {};
							changeMessage.userId = message?.author?.id;
							changeMessage.username = message?.author?.username;
							const arrContent = [];
							arrContent.push(
								{
									"contentId": message.id,
									"createdTimestamp": message.timestamp,
									"content": message.content
								}
							);
							//console.log("check arrContent", arrContent)
							changeMessage.content = arrContent;
							database.messageEveryday.find(x => x.chanelId == chanelRemind.chanelId)?.data.push(changeMessage);
						}
					}
				})
			}
		})
		await client.guilds.fetch();
		lstGuilds = client.guilds.cache.map(guild => guild.id);
		const pr2 = lstGuilds.map(async guild => {
			const checkInfoGui = client.guilds.cache.get(guild);
			await checkInfoGui.members.fetch({ withPresences: true });
			checkInfoGui.members.cache.forEach(member => {
				if (!member.user.bot) {
					const userFind = database.userInfo.find(userFindInDtb => {
						return userFindInDtb?.id === member.user.id
					});
					if (userFind && userFind != 'undefined') {
						console.log("check member", member)
						if (userFind.hasRemindDaily && userFind.existInSeverity) {
							userFind?.chanelRemindId?.forEach(async (chanelId) => {
								const checkDaily = database.messageEveryday.find(x => x.chanelId == chanelId).data.some(userFindMessage => userFindMessage.userId === userFind.id && userFindMessage.content.some(content => content?.content.includes('*daily')));
								if (!checkDaily) {
									const findChanelInDtb = database.chanelRemind.find(x => x.chanelId == chanelId);
									let getNameParentChanel = "";
									if (findChanelInDtb) {
										console.log("check user chưa đaily", userFind)
										const findChanelInDtb = database.chanelRemind.find(x => x.chanelId == chanelId);
										getNameParentChanel = await discordServices.getChanelById(findChanelInDtb?.getChanel.parent_id, findChanelInDtb.authorization);
										if (getNameParentChanel && getNameParentChanel.status === 0)
											member.send(`Daily nào <@${userFind.id}> trên luồng \`${findChanelInDtb?.getChanel.name}\` thuộc chanel \`${getNameParentChanel.data.name}\` !!!`);
									}
								}
							})

						}
					} else {
						database.userInfo.push(member.user);
					}
				}
			});
		})
		await Promise.all([pr1, pr2]);
	}

	async function updateUserJoinSever() {
		const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'))
		await client.guilds.fetch();
		lstGuilds = client.guilds.cache.map(guild => guild.id);
		lstGuilds.map(async guild => {
			const checkInfoGui = client.guilds.cache.get(guild);
			await checkInfoGui.members.fetch();
			checkInfoGui.members.cache.forEach(member => {
				// do stuff with guild members here
				if (!member.user.bot) {
					const userFind = database.userInfo.find(userFindInDtb => userFindInDtb?.id === member.user.id);
					if (!userFind) {
						console.log("check user Find", userFind)
						console.log("check member", member)
						console.log("check member.user", member.user)

						member.existInSeverity = true;
						database.userInfo.push(member.user);

						fs.writeFileSync(__dirname + '\\config\\database.json', JSON.stringify(database, null, 4));
						console.log("check member", database)
					} else {
						userFind.existInSeverity = true;
						fs.writeFileSync(__dirname + '\\config\\database.json', JSON.stringify(database, null, 4));
					}
				}
			});
		})
	}

	async function getAllChanelRegistered() {
		const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'))
		const matrixTable = [];
		const getAllUser = database.userInfo.map(async user => {
			const findChanelInDtb = database.chanelRemind.find(x => x.chanelId == chanelId);
			getNameParentChanel = await discordServices.getChanelById(findChanelInDtb?.getChanel.parent_id, findChanelInDtb.authorization);

		})
	}

	async function updateUserLeaveSever(userId) {
		const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'))
		const findUser = database.userInfo.find(x => x.id == userId)
		if (findUser) {
			findUser.existInSeverity = false;
		}
		fs.writeFileSync(__dirname + '\\config\\database.json', JSON.stringify(database, null, 4));
	}

client.token = process.env.TOKEN_DISCORD;

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`)
	client.user.setActivity("Made by Khavy", { type: "PLAYING" })
	lstGuilds = client.guilds.cache.map(guild => guild.id);
});

client.on('guildMemberAdd', async (member) => {
	// your code here
	await updateUserJoinSever();
});

client.on("guildMemberRemove", async member => {
	await updateUserLeaveSever(member.user.id)
});

client.commands = new Discord.Collection();

cron.schedule(
	'0 10 1 * *',
	async () => {
		await discordServices.getUpdateChanel();
	},
	{
		scheduled: true,
		timezone: 'Asia/Ho_Chi_Minh'
	}
);

cron.schedule(
	'30 9,16 * * 1-5',
	async () => {
		if (new Date().getHours() == 9) {
			discordServices.clearAndInitDataDaily();
		}
		if (new Date().getHours() == 16) {
			console.log("check lstGuilds", lstGuilds)
			await client.guilds.fetch();
			lstGuilds = client.guilds.cache.map(guild => guild.id);
			lstGuilds.forEach(item => {
				let guild = client.guilds.cache.get(item);
				let channel = guild.channels.cache.get(guild.systemChannelId);
				channel.send(' @here Daily nào mọi người ơi ');
			})
		}
	},
	{
		scheduled: true,
		timezone: 'Asia/Ho_Chi_Minh'
	}
);

cron.schedule(
	'35 10,13,16 * * 1-5',
	async () => {
		await discordServices.getMessage();
	},
	{
		scheduled: true,
		timezone: 'Asia/Ho_Chi_Minh'
	}
);

cron.schedule(
	'40,50 16 * * 1-5',
	async () => {
		//chốt duyệt, h duyệt 100 tin cuối db
		await remindDailySendMessage();
	},
	{
		scheduled: true,
		timezone: 'Asia/Ho_Chi_Minh'
	}
);

client.on(Discord.Events.InteractionCreate, async interaction => {
	try {
		console.log("check interaction.user.id", interaction.user.id)
		// if (!interaction.isCommand()) return

		const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'))
		const user = database.users.find(user => user.id === interaction.user.id)

		if (!user) {
			database.users.push({
				id: interaction.user.id,
				model: "text-davinci-003",
				responsesHidden: false
			})
			fs.writeFileSync(__dirname + '\\config\\database.json', JSON.stringify(database, null, 4))
		}

		if (interaction.commandName === "ping") {
			await interaction.deferReply(
				{
					ephemeral: user.responsesHidden
				}
			)
			await interaction.editReply(`\`Tốc độ phản hổi của sever: ${client.ws.ping}ms\``)
		}
		if (interaction.commandName === "generate-image") {
			await interaction.deferReply(
				{
					ephemeral: user.responsesHidden
				}
			)

			const prompt = interaction.options.getString("prompt")
			const response = await openai.createImage({
				prompt: prompt,
				n: 1,
				size: "1024x1024"
			})

			await interaction.editReply(` Trả lời cho: \`${interaction.options.getString("prompt")} \` \n\n` + response.data.data[0].url)
		}


		if (interaction.commandName === "chat") {
			await interaction.deferReply(
				{
					ephemeral: true
				}
			)

			try {
				const messages = await interaction.channel.messages.fetch({ limit: 3 })
				const lastMessages = messages.filter(m => m.author.id === interaction.user.id).map(m => m.content)
				console.log("check lastMessages", lastMessages)
				if (!interaction.isCommand()) return
				const prompt = `${interaction.options.getString("prompt")}`
				const response = await openai.createCompletion({
					model: "text-davinci-003",
					prompt: prompt,
					max_tokens: 2048,
					temperature: 0.9
				})
				await interaction.editReply(` Trả lời cho \`${interaction.options.getString("prompt")}\`:` + `\`${response.data.choices[0].text} \``)
			} catch (err) {
				console.error("check err", err)
				return interaction.editReply("Lỗi request quá lâu hoặc có người hỏi Chat GPT cùng lúc")
			}
		}

		if (interaction.customId === 'modal-register-daily') {
			let chanelId = interaction.fields.getTextInputValue('chanelId');
			if (chanelId.indexOf('/') != - 1) {
				const arrayHttp = chanelId.split('/');
				chanelId = arrayHttp[arrayHttp.length - 1];
			}
			const authorId = interaction.fields.getTextInputValue('authorId');
			console.log("check { chanelId, authorId }", { chanelId, authorId });
			if (chanelId) {

				// let chanel = await discordServices.getChanelById(findChanelInDtb?.getChanel.parent_id, findChanelInDtb.authorization);
				// if (getNameParentChanel && getNameParentChanel.status !== 0) ;

				const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'));
				const findChanelInDtb = database.chanelRemind.find(x => x.chanelId == chanelId)
				const findUser = database.userInfo.find(x => x.id == interaction.user.id);
				if (findChanelInDtb) {//có chanel trong database
					if (findUser) {//trường hợp người dùng đã tồn tại
						if (findUser?.chanelRemindId?.find(x => x == chanelId)) {
							findUser.hasRemindDaily = true;
							await interaction.reply({ content: '\`Đã bật thông báo nhắc daily cho channel, channel nhắc daily đã tồn tại không có gì thay đổi !\`' });
						} else {
							if (findUser?.chanelRemindId) {
								findUser.chanelRemindId.push(chanelId);
								findUser.hasRemindDaily = true;
							} else {
								findUser.chanelRemindId = [chanelId];
								findUser.hasRemindDaily = true;
							}

							await interaction.reply({ content: '\`Thêm channel nhắc daily thành công !\`' });
						}
					} else {
						//trường hợp là người dùng mới
						const newUser = interaction.user;
						newUser.hasRemindDaily = true;
						newUser.chanelRemindId = [chanelId]
						database.userInfo.push(newUser);
						await interaction.reply({ content: '\`Tạo daily với người dùng mới thành công !\`' });

					}
				} else {//không có chanel trong hệ thống

					if (!authorId) {
						await interaction.reply({ content: '\`Cần cung cấp author cho channel !\`' });
					} else {
						const res = await discordServices.getChanelById(chanelId, authorId);
						console.log("check res", res)
						if (res && res.status == 0) {//đã tìm được sever
							console.log("check res", res)
							if (findUser) {//trường hợp người dùng đã tồn tại
								if (findUser?.chanelRemindId?.find(x => x == chanelId)) {//tồn tại chanelId trong nhắc daily

									if (database?.chanelRemind?.find(x => x.chanelId == chanelId)) { //nếu tồn tại ng dùng, tồn tại sever
										findUser.hasRemindDaily = true;
										await interaction.reply({ content: '\`Đã bật thông báo nhắc daily cho channel, channel nhắc daily đã tồn tại không có gì thay đổi !\`' });
									} else {//không tồn tại sever
										findUser.hasRemindDaily = true;

										database.chanelRemind.push({
											"authorization": authorId,
											"chanelId": chanelId,
											"getChanel": res.data
										});
										await interaction.reply({ content: '\`Đã bật thông báo nhắc daily cho channel, đã thêm sever mới vào hệ thống!\`' });
									}
								} else {//chưa tồn tại trong chanel hệ thống nhắc daily
									if (findUser?.chanelRemindId) {
										findUser.chanelRemindId.push(chanelId);
										findUser.hasRemindDaily = true;
									} else {
										findUser.chanelRemindId = [chanelId];
										findUser.hasRemindDaily = true;
									}
									database.chanelRemind.push({
										"authorization": authorId,
										"chanelId": chanelId,
										"getChanel": res.data
									});
									await interaction.reply({ content: '\`Thêm channel nhắc daily thành công !\`' });
								}

							} else {
								//trường hợp là người dùng mới
								const newUser = interaction.user;
								newUser.hasRemindDaily = true;
								newUser.chanelRemindId = [chanelId]
								database.userInfo.push(newUser);

								database.chanelRemind.push({
									"authorization": authorId,
									"chanelId": chanelId,
									"getChanel": res.data
								});
								console.log("check database.chanelRemind", database.chanelRemind)
								await interaction.reply({ content: '\`Tạo mới sever nhắc daily thành công !!! \`' });

							}

						} else {
							await interaction.reply({ content: '\`Thông tin author hoặc thông tin channel không đúng !!! \`' });
						}
					}
				}
				fs.writeFileSync(__dirname + '\\config\\database.json', JSON.stringify(database, null, 4));
			}
			await discordServices.getUpdateChanel();

		}
		if (interaction.commandName === "register-chanel-daily") {

			const modal = new Discord.ModalBuilder()
				.setCustomId('modal-register-daily')
				.setTitle('Đăng ký chanel để nhắc Daily');

			// Create the text input components
			const chanelIdInput = new Discord.TextInputBuilder()
				.setCustomId('chanelId')
				// The label is the prompt the user sees for this input
				.setLabel("chanelId cần nhắc Daily")
				// Short means only a single line of text
				.setStyle(Discord.TextInputStyle.Short);

			const authorIdInput = new Discord.TextInputBuilder()
				.setCustomId('authorId')
				// The label is the prompt the user sees for this input
				.setLabel("authorId")
				// Short means only a single line of text
				.setStyle(Discord.TextInputStyle.Paragraph)
				.setPlaceholder("Có thể không cung cấp, nếu trong database đã có auther đọc được ")
				.setRequired(false);

			const firstActionRow = new Discord.ActionRowBuilder().addComponents(chanelIdInput);
			const secondActionRow = new Discord.ActionRowBuilder().addComponents(authorIdInput);

			modal.addComponents(firstActionRow, secondActionRow);

			// Show the modal to the user
			await interaction.showModal(modal);
		}

		if (interaction.commandName === "list-user-register") {
			// if (!interaction.isCommand()) return
			// await updateUserJoinSever();
			const arrUser = [];
			const database = JSON.parse(fs.readFileSync(__dirname + '\\config\\database.json'))
			const pr1 = database.userInfo.map((user) => {
				if (user.existInSeverity) {
					user?.chanelRemindId?.map((chanelId) => {
						const chanelFind = database.chanelRemind.find(x => x.chanelId == chanelId);
						console.log("check chanelFind?.parentChanel?.name", chanelFind?.parentChanel?.name)
						const userInfo = [];
						userInfo.push(user.username, chanelFind?.parentChanel?.name, chanelFind?.getChanel?.name, user.hasRemindDaily ? "Có" : "Không");
						console.log("check user", user)
						arrUser.push(userInfo);
					})
				}
			})

			Promise.all(pr1);
			let i = 0;
			arrUser.length ? arrUser.forEach((u) => {
				u.unshift(i);
				i++;
			}) : [];
			console.log("check arrUser", arrUser)
			const table = new AsciiTable3('Danh sách thông tin User')
				.setHeading('Stt', 'Tên', 'Kênh', 'Luồng', 'Nhắc daily')
				.setAlignCenter(3, 4, 5)
				.addRowMatrix(arrUser);
			table.setTitleAlign(AlignmentEnum.CENTER);
			table.setStyle("unicode-double")
			await interaction.reply(` \`${table.toString()}\` `)
		}

		if (interaction.commandName === "turn-on-off-remind-daily") {

			const modal = new Discord.ModalBuilder()
				.setCustomId('modal-register-daily')
				.setTitle('Đăng ký chanel để nhắc Daily');

			// Create the text input components
			const chanelIdInput = new Discord.TextInputBuilder()
				.setCustomId('chanelId')
				// The label is the prompt the user sees for this input
				.setLabel("chanelId cần nhắc Daily")
				// Short means only a single line of text
				.setStyle(Discord.TextInputStyle.Short);

			const authorIdInput = new Discord.TextInputBuilder()
				.setCustomId('authorId')
				// The label is the prompt the user sees for this input
				.setLabel("authorId")
				// Short means only a single line of text
				.setStyle(Discord.TextInputStyle.Paragraph)
				.setPlaceholder("Có thể không cung cấp, nếu trong database đã có auther đọc được ")
				.setRequired(false);

			const firstActionRow = new Discord.ActionRowBuilder().addComponents(chanelIdInput);
			const secondActionRow = new Discord.ActionRowBuilder().addComponents(authorIdInput);

			modal.addComponents(firstActionRow, secondActionRow);

			// Show the modal to the user
			await interaction.showModal(modal);
		}

		if (interaction.commandName === "turn-off-remind-daily") {
			const tOf = await discordServices.turnOffRemind(interaction.user.id);
			interaction.reply(tOf)
		}

		if (interaction.commandName === "turn-on-remind-daily") {
			const tOn = await discordServices.turnOnRemind(interaction.user.id);
			interaction.reply(tOn)
		}

	} catch (err) {
		console.log("check err", err)
		await interaction.editReply({
			content: "Yikes! It looks like something went wrong... Perhaps try again?"
		})
	}
})



client.on("messageCreate", async (message) => {
	console.log("check message", message);
	if (message.author.bot) return
	if (!message.author.bot) {

		if (constant.ARRAY_TUCTIEU.some((v) => {
			// console.log("check message.content.toLocaleLowerCase().indexOf(v)",message.content.toLocaleLowerCase().indexOf(v));
			// console.log("check v", v)
			return message.content.toLocaleLowerCase().indexOf(v) >= 0
		})) {
			message.channel.send(`Lớn rồi, văn minh lên nào <@${message.author.id}> `);
		}

		await util.caseMessage(message.content, { lstGuild, lstChanel, message });
		if (message.content == constant.GET_DAILY) {
			const lstGuildCli = client.guilds.cache.map(guild => guild.id);
			lstGuildCli.map(async guildId => {
				let guild = client.guilds.cache.get(guildId);
				let channel = guild.channels.cache.get(guild?.systemChannelId);
				channel.send(" @here Daily nào mọi người ơi !!")
			})
		}
		if (message.content == constant.CHUC_TET) {
			message.channel.send(" @here Happy New Year! Thế là một năm cũ đã qua và chúng ta lại cùng nhau chào đón năm mới. Chúc cho tất cả các anh chị em đồng nghiệp đáng mến một năm nhiều sức khỏe, thành công hơn gấp 5 gấp 10 năm cũ. Chúc cả nhà an khang thịnh vượng, công việc thuận lợi, tiền tài suôn sẻ, thăng tiến vèo vèo nhé!!!")
		}
		if (message.content == constant.NHAU) {
			message.channel.send("Anh em ơi hôm nay là thứ 6 rồi, cho tôi thấy cánh tay của anh em nào. Nhậu thôi còn chần chờ gì nữa. !!! \n https://cdn.discordapp.com/attachments/990141662665777172/1071014928368025630/tungvi.mp4 ")
		}
		if (message.content == constant.KE) {
			message.channel.send("https://cdn.discordapp.com/attachments/1063476637812916227/1071009828647993414/tinhtam.mp4")
		}


	}

	// await remindDailySendMessage();

	// client.user.id
	// message.mentions.has(client.user.id)

	// saveUser(data);
	// saveMassageDaily(message.author.id, message.content, message.createdTimestamp.toString())

	// discordServices.clearAndInitDataDaily();
	// await discordServices.getMessage();

	// await discordServices.getUpdateChanel();
	// await updateUserJoinSever();


})
try {
	client.login(process.env.TOKEN_DISCORD);
} catch (err) {
	console.error(err)
}

}
module.exports = { botDiscord }