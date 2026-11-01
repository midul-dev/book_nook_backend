import express from "express";
import { MongoClient } from "mongodb";
import 'dotenv/config'


const app = express();
const PORT = process.env.PORT || 5000;

const client = new MongoClient("mongodb://<db_username>:<db_password>@ac-auhxnex-shard-00-00.ekwx5uj.mongodb.net:27017,ac-auhxnex-shard-00-01.ekwx5uj.mongodb.net:27017,ac-auhxnex-shard-00-02.ekwx5uj.mongodb.net:27017/?ssl=true&replicaSet=atlas-lv7u6f-shard-0&authSource=admin");
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

app.get("/", (req, res) => {
  res.send("Hello BookNook Server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
