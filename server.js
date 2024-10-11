import app from "./index.js";
import { connectToMongoDB } from "./src/config/mongodb.config.js";
import express from "express";

app.listen(3600, (req, res) => {
  console.log("Server is listening on 3600.");
  connectToMongoDB();
});
