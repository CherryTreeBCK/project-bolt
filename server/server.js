import 'dotenv/config'
import express from "express";
import cors from "cors";
import { main, enrichProfileData } from "./index.js";
import { classifyFollowers } from "./aiSorting.js";
import { exportTableToCSV } from "./saveCsv.js";
import OpenAI from 'openai';
import runClassifyRouter from './runClassify.js';

const app = express();
app.use(cors());  
app.use(express.json());
app.use('/api/run-classify', runClassifyRouter);

app.get('/api/config', (req, res) => {
  res.json({ maxImportFollowers: process.env.MAX_IMPORT_FOLLOWERS });
});

app.post("/api/generate-message", async (req, res) => {
  const { username, category, extraInstructions } = req.body;
  if (!username || !category) return res.status(400).send("Missing parameters");

  try {
    let safeExtra = "";
    if (typeof extraInstructions === "string") {
      safeExtra = extraInstructions.trim();
      const MAX_EXTRA_CHARS = 1200;
      if (safeExtra.length > MAX_EXTRA_CHARS) {
        safeExtra = safeExtra.slice(0, MAX_EXTRA_CHARS) + "…";
      }
    }

    let userContent = `
    Username: ${username}
    Category: ${category}

    Generate a short, friendly message to send to this follower.
    `.trim();

    if (safeExtra) {
      userContent = userContent + "\n\nAdditional instructions:\n" + safeExtra;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            You are a professional marketing assistant.
            Generate friendly, concise messages for new followers based on their business category.
          `,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      max_tokens: 150,
    });

    const message = completion.choices[0].message.content.trim();
    res.json({ message });

  } catch (err) {
    console.error("OpenAI request error:", err);
    res.status(500).json({ error: "Failed to generate message" });
  }
});


app.get("/api/progress", (req, res) => {
  console.log("SSE client connected");
  // required headers for SSE
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // send headers immediately
  res.flushHeaders?.();

  const ownerAccount = req.query.ownerAccount ? decodeURIComponent(req.query.ownerAccount) : null;
  console.log('SSE request ownerAccount:', ownerAccount);

  let clientClosed = false;
  req.on("close", () => {
    console.log("SSE client disconnected");
    clientClosed = true;
  });

  const sendEvent = (dataObj) => {
    try {
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

      await main((dataObj) => {
        if (clientClosed) return;
        sendEvent(dataObj);
      }, ownerAccount);

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
      await exportTableToCSV("followers_duplicate_new");

      sendEvent({ status: "All tasks completed!", progress: 1, done: true });
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
