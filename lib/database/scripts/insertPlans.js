// File: insertPlans.js

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI ="";
  
const DB_NAME = "";

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
  process.exit(1);
}

// Define the Plan schema
const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
});

// Create the Plan model
const Plan = mongoose.model("Plan", PlanSchema);

const plans = [
  {
    name: "Basic Package",
    amount: 1000,
    credits: 20,
  },
  {
    name: "Pro Package",
    amount: 3000,
    credits: 120,
  },
  {
    name: "Premium Package",
    amount: 5000,
    credits: 2000,
  },
];

async function insertPlans() {
  try {
    // Connect to the specific database
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
    });
    console.log(`Connected to database: ${DB_NAME}`);

    await Plan.deleteMany({});
    console.log("Existing plans cleared");

    const insertedPlans = await Plan.insertMany(plans);
    console.log(`Successfully inserted ${insertedPlans.length} plans:`);
    insertedPlans.forEach((plan) => {
      console.log(`- ${plan.name}: ${plan.credits} credits for ${plan.amount}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

insertPlans();
