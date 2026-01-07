import express from "express";
import cors from "cors";
import { CONNECT_DB } from "./config/mongodb";
import { env } from "./config/environment";
import { APIs_V1 } from "./routes/v1";
import cookieParser from "cookie-parser";

const START_SERVER = () => {
  const app = express();

  // Đọc JSON body từ FE
  app.use(express.json());

  // Đọc cookie
  app.use(cookieParser());

  app.use(
    cors({
      origin: env.CLIENT_URL, // frontend
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  // Prefix chung cho API v1
  app.use("/v1", APIs_V1);

  app.listen(env.APP_PORT, env.APP_HOST, async () => {
    console.log(
      `Hello Hieu C0bra Dev, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`
    );
  });
};

(async () => {
  try {
    console.log("1. Connecting to MongoDB Cloud Atlas...");
    await CONNECT_DB();
    console.log("2. Connecting to MongoDB successful!");
    START_SERVER();
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
})();
