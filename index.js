import "dotenv/config";
import express from "express";
import axios from "axios";
import cron from "node-cron";
import Database from "better-sqlite3";
import moment from "moment";

const port = process.env.PORT;
const app = express();
const db = new Database("data.db");

// Serve collected data
app.get("/", (req, res) => {
  const homepage = `
    /data - retrieve last rows
    Optional Query Parameters:
    startTime - specify a time to start (YYYY-MM-DD HH:MM:SS)
    endTime - specify a time to end (YYYY-MM-DD HH:MM:SS)
    results (default: 100) - number of results to return per query
    page (default: 0) - current page of results
    onlyDown (default: false) - only list times when it was down
`;
  res.send(homepage);
});

// Serve collected data
app.get("/data", (req, res) => {
  // Query parameters
  const startTime = req.params.startTime || "2022-01-01 00:00:00";
  const endTime = req.params.endTime || moment('YYYY-MM-DD HH:mm:ss');
  const page = req.params.page || 0;
  const results = req.params.results || 100;
  const onlyDown = req.params.onlyDown || false;

  const data = db
    .prepare("SELECT status, response_time, check_time FROM data WHERE check_time BETWEEN @startTime AND @endTime LIMIT @results")
    .all();
  res.json(data);
});

// Manually initiate a check
app.get("/check", (req, res) => {
  res.send(initiateHeartbeatCheck());
});

// Schedule check at regular interval
cron.schedule(`*/${process.env.CHECK_INTERVAL} * * * * *`, () => {
  initiateHeartbeatCheck();
});

// Start server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

async function initiateHeartbeatCheck() {
  //const res = await axios.get(process.env.URL_TO_CHECK);
  const query = db
    .prepare("INSERT INTO data (status, response_time) VALUES (?, ?)")
    .run("200", ".3s");
  return query.changes;
}
