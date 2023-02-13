import constant from "../constant/constant";
import discordServices from "../services/discordServices";
const caseMessage = async(content, options) =>{
	switch(content) {
		case constant.SYNC:
			break;
		case constant.GET_DAILY:
			await discordServices.dailyUser("data",options);
			break;
		default:
			// code block
	}
}
module.exports = {
	caseMessage
}