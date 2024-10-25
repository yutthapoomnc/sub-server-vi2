require("dotenv").config();
const { MongoClient } = require("mongodb");

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

let mongoClient, db;

async function connectMongo() {
  const mongoOptions = {
    serverSelectionTimeoutMS: 60000, // เพิ่ม timeout เป็น 60 วินาที
  };
  const client = new MongoClient(mongoUrl, mongoOptions);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const db = client.db(dbName);
    return { client, db };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    if (client) client.close();
    throw new Error("Failed to connect to MongoDB");
  }
}

// เชื่อมต่อกับ MongoDB
const initializeMongoDB = async () => {
  try {
    const connection = await connectMongo();
    mongoClient = connection.client;
    db = connection.db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = { connectMongo, initializeMongoDB };
