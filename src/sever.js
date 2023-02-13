import express from "express";
import bodyParser from "body-parser";
import { botDiscord } from "./discord";
require('dotenv').config();
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: process.env.OPEN_API_KEY
})

console.log("check api key: " + process.env.OPEN_API_KEY)
const openai = new OpenAIApi(configuration);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
	try {
		const prompt =req.body.prompt;
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: "làm cách nào giải quyết tình trạng ô nhiễm môi trường",
		},{
			timeout: 3000,
		});
		res.status(200).send({
			bot: response.data.choices[0].text
		})
	} catch (err) {
		console.log("check err",err)
		res.status(400).send({err})
	}
}
);

botDiscord(app);


app.use((req, res) => {
	return res.send("404 not found");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log("bot nodejs and react " + PORT);
});