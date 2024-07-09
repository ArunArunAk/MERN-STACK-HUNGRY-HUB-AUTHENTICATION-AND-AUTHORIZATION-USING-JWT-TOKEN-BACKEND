const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
 
const cors = require('cors');
const userrouter = require('./routes/userrouter');

const app = express();
const port = 4800;
const password = encodeURIComponent("Arun123#");

const mongoDbUrl = `mongodb+srv://arunarun2gs:${password}@cluster0.cgnglhb.mongodb.net/mernstackAuthServices?retryWrites=true&w=majority&appName=Cluster0`;


async function connectToDatabase() {
  try {
    await mongoose.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true 
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

connectToDatabase();

app.use(cors({
  origin:["http://localhost:3000"],
  credentials:true 
}));

// Add body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(cookieParser());
app.use('/auth', userrouter);

app.get("/", (req, res) => {
  res.send("Hello World!"); 
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
