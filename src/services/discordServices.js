import axios from "../setup/axios";
import db from '../models/index.js';
import axiosSetup from "../setup/axios";
import constant from "../constant/constant";
const fs = require('node:fs');
const path = require('path');

const wait = ms => new Promise(
	(resolve, reject) => setTimeout(resolve, ms)
);

const syncUser = async (data, options) => {
	try {
		if (!options) return {
			EM: 'Requires an option',
			EC: -1,
			DT: data
		}
		const { lstGuild, lstChanel } = options;
		if (lstGuild?.length <= 0 || lstChanel.length <= 0) return {
			EM: 'Requires an option',
			EC: -1,
			DT: data
		}
		const pr1 = new Promise(async (resolve, reject) => {
			const lstDtbUser = (await db.users.findAll({ attributes: ['userId'], raw: true })).map((x) => x.userId);
			// Promise.all([lstDtbUser, listDtbGuil, lstDtbChanel]);
			const arrIdUser = [];
			lstChanel.forEach(async (chanel) => {
				for (var i in chanel) {
					const messageAll = await axios.getMessageAxios(chanel[i]);
					await wait(500);
					messageAll?.forEach(async (message) => {
						let idUser = message?.author.id;
						// console.log("idUser", idUser)
						if (!arrIdUser.some(x => x == idUser)) {
							arrIdUser.push(idUser);
							if (!lstDtbUser.some(x => x == message?.author?.id)) {
								await db.users.create({
									userId: message?.author?.id,
									userName: message?.author?.username,
									avatar: message?.author?.avatar,
									guildId: message?.message_reference?.guild_id
								})
							}
						};
					})
				}
			});
		});
		return {
			EM: 'get data',
			EC: 0,
			DT: data
		}
	} catch (err) {
		console.log("error from service : >>>", err);
		return {
			EM: 'Something wrong ...',
			EC: '-2',
			DT: ''
		}
	}
}

const dailyUser = async (data,option) => {
	try {
		const data = await db.users.findAll({where:{messageDaily:null}, raw:true})
		console.log("check data", )
		return {
			EM: 'get data',
			EC: 0,
			DT: data
		}
	} catch (err) {
		console.log("error from service : >>>", err);
		return {
			EM: 'Something wrong ...',
			EC: '-2',
			DT: ''
		}
	}
}

const clearDataDaily = async () => {
	try {
		await db.sequelize.query(`update users set messageDaily = null`);
	} catch (err) {
		console.log("error from service : >>>", err);
		return {
			EM: 'Something wrong ...',
			EC: '-2',
			DT: ''
		}
	}
}

function isRealValue(obj) {
	return obj && obj !== 'null' && obj !== 'undefined';
}

const getChanelById = async (chanelId, auth = null) => {
	try {
		const getChanel = await axiosSetup.getChanelAxios(chanelId, auth);
		if (getChanel?.response && getChanel?.response?.status != 200) return {
			status: -1,
			data: ''
		}

		return {
			status: 0,
			data: getChanel
		}
	} catch (err) {
		console.error("check error: ", err)
	}
}

const getMessageById = async (chanelId, auth = null) => {
	try {
		const getMessage = await axiosSetup.getMessageAxios(chanelId, auth);
		if (getMessage?.response && getMessage?.response?.status != 200) return {
			status: -1,
			data: ''
		}

		return {
			status: 0,
			data: getMessage
		}
	} catch (err) {
		console.error("check error: ", err)
	}
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const getUpdateChanel = async () => {
	try {
		const databaseOrigin = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')))
		const database = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')))
		const pr1 = databaseOrigin.chanelRemind?.map(async (chanel) => {
			const getChanel = await getChanelById(chanel.chanelId, chanel?.authorization);
			if (getChanel && getChanel.status === 0) {
				const parentChanel = await getChanelById(getChanel.data.parent_id, chanel?.authorization);
				console.log("check getChanel", JSON.stringify(getChanel.data.parent_id ), "authorization", chanel?.authorization)
				const findChanelRemind = database.chanelRemind.findIndex(x => x.chanelId === chanel.chanelId);
				if (findChanelRemind != -1){
					const addChanel = database.chanelRemind[findChanelRemind];
					addChanel.getChanel = getChanel.data;
					if(parentChanel && parentChanel.status === 0){
						addChanel.parentChanel = parentChanel.data
					}
				}
			} else {
				//chanel mới
			}
		})
		await Promise.all(pr1)
		fs.writeFileSync(path.join(__dirname,'..','config', 'database.json'), JSON.stringify(database, null, 4));
	} catch (err) {
		console.error("check error: ", err)
	}
}

const clearAndInitDataDaily = () => {
	const database = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')))
	database.messageEveryday = [];
	database.chanelRemind?.map(async chanelRemind => {
		database.messageEveryday.push({
			chanelId: chanelRemind.chanelId,
			data: []
		})
	})
	fs.writeFileSync(path.join(__dirname,'..','config', 'database.json'), JSON.stringify(database, null, 4));
}

const getMessage = async () => {
	const databaseOriginGetChanel = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')))
	const database = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')));
	databaseOriginGetChanel.chanelRemind?.map(async chanelRemind => {
		const lsMessages = await getMessageById(chanelRemind.chanelId, chanelRemind.authorization)
		const currentDate = new Date();
		if (lsMessages && lsMessages.status === 0) {
			lsMessages?.data?.map(async (message) => {
				if (message.timestamp && (new Date(message.timestamp)).getDate() == currentDate.getDate()) {

					let messageFind = database.messageEveryday.find(x => x.chanelId == chanelRemind.chanelId)?.data.find(userMessage => userMessage?.userId === message?.author?.id);
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
						messageFind = {};
						messageFind.userId = message?.author?.id;
						messageFind.username = message?.author?.username;
						let arrContent = [];
						arrContent.push(
							{
								"contentId": message.id,
								"createdTimestamp": message.timestamp,
								"content": message.content
							}
						);
						//console.log("check arrContent", arrContent)
						messageFind.content = arrContent;
						database.messageEveryday.find(x => x.chanelId == chanelRemind.chanelId)?.data.push(messageFind);
					}
				}
			})
		}
		fs.writeFileSync(path.join(__dirname,'..','config', 'database.json'), JSON.stringify(database, null, 4));

	})
	

}
const turnOffRemind = async(userId) =>{
	console.log("check __dirname", path.join(__dirname,'..','config', 'database.json'))
	console.log("check database",fs.readFileSync(path.join(__dirname,'..','config', 'database.json')))
	const database = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')));
	const user = database.userInfo.find(x=> x.id ==userId)
	if(user){
		user.hasRemindDaily = false;
		fs.writeFileSync(path.join(__dirname,'..','config', 'database.json'), JSON.stringify(database, null, 4));
		return "Đã tắt tính năng nhắc daily cho bạn"
	}else{
		return "Người dùng không tìm thấy"
	}
}

const turnOnRemind = async(userId) =>{
	const database = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config', 'database.json')))
	const user = database.userInfo.find(x=> x.id ==userId)
	if(user){
		user.hasRemindDaily = true;
		fs.writeFileSync(path.join(__dirname,'..','config', 'database.json'), JSON.stringify(database, null, 4));
		return "Bật tính năng nhắc daily hàng ngày thành công"
	}else{
		return "Người dùng không tìm thấy"
	}
}

module.exports = {
	syncUser,
	dailyUser,
	clearDataDaily,
	turnOffRemind,
	turnOnRemind,
	getMessage,
	clearAndInitDataDaily,
	getUpdateChanel,
	delay,
	getMessageById,
	getChanelById,
	isRealValue,
	clearDataDaily
}