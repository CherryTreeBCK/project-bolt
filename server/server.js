import express from "express";
import cors from "cors";
import { main, enrichProfileData } from "./index.js";
import { classifyFollowers } from "./aiSorting.js";
import { exportTableToCSV } from "./saveCsv.js";

const app = express();
app.use(cors());

app.get("/api/progress", (req, res) => {
  console.log("SSE client connected");
  // required headers for SSE
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // send headers immediately
  res.flushHeaders?.();

  let clientClosed = false;
  req.on("close", () => {
    console.log("SSE client disconnected");
    clientClosed = true;
  });

  const sendEvent = (dataObj) => {
    try {
      // defensively normalize progress to a number between 0..1 when present
      if (typeof dataObj.progress === "number") {
        if (!isFinite(dataObj.progress)) dataObj.progress = 0;
        dataObj.progress = Math.max(0, Math.min(1, dataObj.progress));
      }
      res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
    } catch (err) {
      console.error("Failed to send SSE event:", err);
    }
  };

  (async () => {
    try {
      sendEvent({ status: "Running basic followers fetch...", progress: 0 });

      // IMPORTANT: pass a single-argument object callback to the task functions
      await main((dataObj) => {
        if (clientClosed) return;
        sendEvent(dataObj);
      });

      sendEvent({ status: "Running profile data enrichment...", progress: 0 });
      await enrichProfileData((dataObj) => {
        if (clientClosed) return;
        sendEvent(dataObj);
      });

      sendEvent({ status: "Running AI classification...", progress: 0 });
      await classifyFollowers((dataObj) => {
        if (clientClosed) return;
        sendEvent(dataObj);
      });

      sendEvent({ status: "Exporting followers to CSV...", progress: 0 });
      await exportTableToCSV("followers_duplicate");

      sendEvent({ status: "All tasks completed!", progress: 1, done: true });
      // end the stream cleanly
      res.write("event: done\n");
      res.write("data: {}\n\n");
      res.end();
    } catch (error) {
      console.error("Task error:", error);
      sendEvent({ status: `Error: ${error.message}`, error: true });
      res.end();
    }
  })();
});

app.listen(3001, () => {
  console.log("Server listening on http://localhost:3001");
});
