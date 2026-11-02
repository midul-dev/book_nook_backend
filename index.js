import express from "express";
import { MongoClient, ObjectId } from "mongodb";
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
  const {image, title, author, description} = req.body;
  const newBook = {
    image: image.trim(),
    title: title.trim(),
    author: author.trim(),
    description: description.trim(),
    createdAt: new Date()
  };
  try {
    const result = await addedCollection.insertOne(newBook);
    res.send(result);
  } catch (error) {
    console.error("Error inserting book:", error);
    res.status(500).send("An error occurred while adding the book.");
  }
})

app.get("/latest-books", async (req, res) => {
  try {
    const latestBooks = await addedCollection.find({}).sort({ createdAt: -1 }).limit(3).toArray();
    res.send(latestBooks);
  } catch (error) {
    console.error("Error fetching latest books:", error);
    res.status(500).send("An error occurred while fetching the latest books.");
  }
});

app.get("/all-books", async (req, res) => {
  try {
    const allBooks = await addedCollection.find({}).toArray();
    res.send(allBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("An error occurred while fetching the books.");
  }
});

app.get("/all-books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await addedCollection.findOne({ _id: new ObjectId(id) });
    if (!book) {
      return res.status(404).send("Book not found.");
    }
    res.send(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send("An error occurred while fetching the book.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
