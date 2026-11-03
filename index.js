import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
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
const addedCollection = db.collection("books");
const borrowsCollection = db.collection("borrows");

app.get("/", (req, res) => {
  res.send("Hello BookNook Server!");
});

app.post("/add-books", async (req, res) => {
  const { image, title, author, description, userEmail, ...otherData } =
    req.body;

  try {
    const isExiting = await addedCollection.findOne({
      title: title?.trim(),
      userEmail: userEmail,
    });

    if (isExiting) {
      return res
        .status(400)
        .json({ error: "You have already added this book." });
    }
    const newBook = {
      image: image?.trim(),
      title: title?.trim(),
      author: author?.trim(),
      description: description?.trim(),
      userEmail: userEmail,
      ...otherData,
      createdAt: new Date(),
    };

    const result = await addedCollection.insertOne(newBook);
    res.status(200).json({message : "Book added successfully! It is now available for borrowing."});
  } catch (error) {
    console.error("Error inserting book:", error);
    res.status(500).send("An error occurred while adding the book.");
  }
});

app.post("/add-borrow", async (req, res) => {
  const borrows = req.body;
  try {
    const isAlreadyBowwrow = await borrowsCollection.findOne({
      bookId: borrows.bookId,
      userEmail: borrows.userEmail,
    });

    if (isAlreadyBowwrow) {
      return res
        .status(400)
        .json({ error: "You have already borrowed this book." });
    }

    const result = await borrowsCollection.insertOne(borrows);
    res.json({ message: "You Borrowing is Successfull" });
  } catch (error) {
    console.error("Error inserting book:", error);
    res
      .status(500)
      .json({ error: "An error occurred while borrowing the book." });
  }
});

app.delete("/return-book/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await borrowsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Book returned successfully" });
    } else {
      res.status(404).json({ error: "Borrow record not found" });
    }
  } catch (error) {
    console.error("Error returning book:", error);
    res
      .status(500)
      .json({ error: "An error occurred while returning the book." });
  }
});

app.get("/my-borrows", async (req, res) => {
  const email = req.query.email;
  const result = await borrowsCollection.find({ userEmail: email }).toArray();
  res.send(result);
});

app.get("/latest-books", async (req, res) => {
  try {
    const latestBooks = await addedCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
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

app.get("/my-books", async (req, res) => {
  const email = req.query.email;
  const myBooks = await addedCollection.find({ userEmail: email }).toArray();
  res.json(myBooks);
});

app.delete("/delete-book/:id", async (req, res) => {
  const id = req.params.id;
  const result = await addedCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 1) {
    res.status(200).json({ message: "Successfully deleted the book." });
  } else {
    res.status(404).json({ error: "Book not found." });
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
});
