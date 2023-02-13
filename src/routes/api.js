import express from 'express';
require('dotenv').config();

const router = express.Router();

const apiRouter = (app)=>{
	// router.all("*");
	
	return app.use("/api/v1/", router);
}

export default apiRouter;