const axios = require("axios");
import constant from "../constant/constant";
require('dotenv').config();

const getAxios = async(url, options = null) =>{
	await axios.get(url,{
		headers: {
			"accept-language": "en-US,en;q=0.9,it;q=0.8,de;q=0.7,es;q=0.6,pt;q=0.5",
			"Content-Type": "application/json;charset=UTF-8",
			"authorization": constant.AUTHOR,
			"Cookie" : constant.COOKIE,
		},
	})
	.then(({data}) => {
		return data;
	})
	.catch((err)=>{
		return err;
	});
}
const postAxios = async(url, options) =>{
	await axios.post(url,{
		headers: {
			"accept-language": "en-US,en;q=0.9,it;q=0.8,de;q=0.7,es;q=0.6,pt;q=0.5",
			"Content-Type": "application/json;charset=UTF-8",
			"authorization": constant.AUTHOR,
			"Cookie" : constant.COOKIE,
		},
	})
	.then(({data}) => {
		return data;
	})
	.catch((err)=>{
		return err;
	});
}

const getMessageAxios = async(chanel, authorization = null,  options = '' ) =>{
	return await axios.get(`https://discord.com/api/v9/channels/${chanel}/messages?limit=100&${options}`,{
		headers: {
			"accept-language": "en-US,en;q=0.9,it;q=0.8,de;q=0.7,es;q=0.6,pt;q=0.5",
			"Content-Type": "application/json;charset=UTF-8",
			"authorization": authorization? authorization : constant.AUTHOR,
			// "Cookie" : constant.COOKIE,
		},
	})
	.then(({data}) => {
		return data;
	})
	.catch((err)=>{
		
		return err;
	});
}

const getChanelAxios = async(chanel, authorization = null,  options = '' ) =>{
	return await axios.get(`https://discord.com/api/v9/channels/${chanel}`,{
		headers: {
			"accept-language": "en-US,en;q=0.9,it;q=0.8,de;q=0.7,es;q=0.6,pt;q=0.5",
			"Content-Type": "application/json;charset=UTF-8",
			"authorization": authorization ? authorization : constant.AUTHOR,
		},
	})
	.then(({data}) => {
		return data;
	})
	.catch((err)=>{
		// console.log('check error', JSON.stringify(err) )
		return err;
	});
}

const getImageAxios = async(userId, avatarId) =>{
	return await axios.get(`https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`,{
		headers: {
			"accept-language": "en-US,en;q=0.9,it;q=0.8,de;q=0.7,es;q=0.6,pt;q=0.5",
			"Content-Type": "application/json;charset=UTF-8",
			"authorization": constant.AUTHOR,
			"Cookie" : constant.COOKIE,
		},
	})
	.then(({data}) => {
		return data;
	})
	.catch((err)=>{
		return err;
	});
}

const getLinkCDNAvatar = ((guildId, userId, avatarId) =>{
	return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${avatarId}.webp?size=4096`;
})


module.exports = {
	getAxios,
	getMessageAxios,
	postAxios,
	getImageAxios,
	getLinkCDNAvatar,
	getChanelAxios
}