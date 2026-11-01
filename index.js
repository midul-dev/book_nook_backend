import express from "express";
import { MongoClient } from "mongodb";
import 'dotenv/config'
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const dbClient = await connectToMongoDB();
const db = dbClient.db("book_nook");
const addedCollection = db.collection("my-books");


app.get("/", (req, res) => {
  res.send("Hello BookNook Server!");
});

app.post("/add-books", async (req, res) => {
  const myBooks = req.body;
  try {
    const result = await addedCollection.insertOne(myBooks);
    res.send(result);
  } catch (error) {
    console.error("Error inserting book:", error);
    res.status(500).send("An error occurred while adding the book.");
  }
})

app.get("/my-books", async (req, res) => {
  try {
    const books = await addedCollection.find({}).toArray();
    res.send(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("An error occurred while fetching the books.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
