import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "./environment";
// khởi tại ra một đối tượng cflixDatabaseInstance ban đầu là null vì chưa connect với database
let cflixDatabaseInstance = null;

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const CONNECT_DB = async () => {
  await client.connect();
  cflixDatabaseInstance = client.db(env.DATABASE_NAME);
};

export const GET_DB = () => {
  if (!cflixDatabaseInstance) throw new Error("Database is not connected");
  return cflixDatabaseInstance;
};
