const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const userRoute = require("./routes/user");
app.use(userRoute);

const offerRoute = require("./routes/offer");
app.use(offerRoute);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
