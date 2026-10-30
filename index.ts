import express from "express";
import app from "./server/src/app.js";

const handler = express();
handler.use(app);

export default handler;
