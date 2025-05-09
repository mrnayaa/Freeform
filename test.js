const INDICATORS = [
  { key: "Score 2025", label: "Global Score", rotation: 0 },
  { key: "Political Context", label: "Political Indicator", rotation: 30 },
  { key: "Economic Context", label: "Economic Indicator", rotation: 60 },
  { key: "Legal Context", label: "Legislative Indicator", rotation: 80 },
  { key: "Social Context", label: "Sociocultural Indicator", rotation: 120 },
  { key: "Safety", label: "Security Indicator", rotation: 150 }
];

const rssFeeds = {
  "United States": "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  "Norway": "https://www.aftenposten.no/rss",
  "Germany": "https://www.spiegel.de/international/index.rss",
  "France": "https://www.france24.com/en/rss",
  "Japan": "https://newsonjapan.com/rss/top.xml",
  "Mexico": "https://mexiconewsdaily.com/feed/",
  "Canada": "https://globalnews.ca/feed/"
};

function getOffset(score) {
  return (100 - score) * 0.1; // Adjust distortion based on score
}

function parseScore(raw) {
  return parseFloat(String(raw).replace(",", ".")) || 50;
}

async function fetchHeadline(feedUrl) {
  try {
    const response = await fetch(`http://localhost:3000/api/headline?url=${encodeURIComponent(feedUrl)}`);
    const data = await response.json();
    return data.title || "No headline available";
  } catch (err) {
    console.error("Failed to fetch article:", err);
    return "No headline available";
  }
}

function createDistortedHeadline(text, offset) {
  const scrollBox = document.createElement("div");
  scrollBox.className = "scroll-box";

  const container = document.createElement("div");
  container.className = "rgb-text";

  // Create layered headline text
  ["red", "green", "blue", "main"].forEach((color) => {
    const span = document.createElement("span");
    span.className = `headline-layer ${color}`;
    span.textContent = text;

    if (color === "red") span.style.transform = `translate(${offset}px, 0)`;
    if (color === "green") span.style.transform = `translate(-${offset}px, 0)`;
    if (color === "blue") span.style.transform = `translate(0, ${offset}px)`;

    container.appendChild(span);
  });

  scrollBox.appendChild(container);
  document.body.appendChild(scrollBox); // temp to measure

  requestAnimationFrame(() => {
    const width = container.offsetWidth;
    const speed = 60; // pixels per second
    const duration = (width + window.innerWidth) / speed;

    container.style.animationDuration = `${duration}s`;
    document.body.removeChild(scrollBox); // remove temp
  });

  return scrollBox;
}

async function renderCountrySection(section, data) {
  const country = section.getAttribute("data-country");
  const feedUrl = rssFeeds[country];
  if (!feedUrl) return;

  const headline = await fetchHeadline(feedUrl);
  const record = data.find(row => row["Country_EN"] === country) || {};

  for (const { key, label } of INDICATORS) {
    const score = parseScore(record[key]);
    const offset = getOffset(score);

    const row = document.createElement("div");
    row.className = "indicator-row";

    const distorted = createDistortedHeadline(headline, offset);
    row.appendChild(distorted);

    const scoreLabel = document.createElement("div");
    scoreLabel.className = "score-display";
    scoreLabel.textContent = `${country} — ${label}: ${score.toFixed(2)}`;
    row.appendChild(scoreLabel);

    section.appendChild(row);
  }
}

async function renderAll() {
  const response = await fetch("data.json");
  const data = await response.json();

  const sections = document.querySelectorAll(".country-section");
  for (const section of sections) {
    await renderCountrySection(section, data);
  }
}

function setupThemeToggle() {
  const toggleBtn = document.querySelector(".theme-toggle-btn");

  toggleBtn.addEventListener("click", () => {
    const isNowDark = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode", isNowDark);
    document.body.classList.toggle("light-mode", !isNowDark);
    toggleBtn.classList.toggle("theme-dark", !isNowDark);
    toggleBtn.classList.toggle("theme-light", isNowDark);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  renderAll();
});