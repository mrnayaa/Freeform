const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const port = 3000;
const parser = new Parser();

app.use(cors());

app.get('/api/headline', async (req, res) => {
  const feedUrl = req.query.url;
  if (!feedUrl) return res.status(400).json({ error: "Missing feed URL" });

  try {
    const feed = await parser.parseURL(feedUrl);
    if (feed.items.length > 0) {
      const randomIndex = Math.floor(Math.random() * feed.items.length);
      res.json({ title: feed.items[randomIndex].title });
    } else {
      res.json({ title: "No articles found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse feed" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});

