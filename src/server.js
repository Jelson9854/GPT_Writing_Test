import express from "express";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import POST from "./ai.js";

const app = express();
const port = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '..', "/public")));

// Use body-parser middleware
app.use(bodyParser.json()); // Parse JSON bodies

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', "/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post("/chat", async (req, res) => {
  //console.log(req.body);
  const mess = req.body;
  const response = await POST(mess);
  res.send(response);
});