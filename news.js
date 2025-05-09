const INDICATORS = [
  { key: "Score", label: "Global Score", rotation: 0 },
  { key: "Political Context", label: "Political", rotation: 30 },
  { key: "Economic Context", label: "Economic", rotation: 60 },
  { key: "Legal Context", label: "Legal", rotation: 80 },
  { key: "Social Context", label: "Social", rotation: 120 },
  { key: "Safety", label: "Safety", rotation: 150 }
];

const rssFeeds = {
  "United States": "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  "Norway": "https://www.aftenposten.no/rss",
  "Germany": "https://www.spiegel.de/international/index.rss",
  "Brazil": "https://www.brasilwire.com/feed/",
  "India": "https://www.ndtv.com/rss",
  "Russia": "https://www.themoscowtimes.com/rss",
  "China": "https://www.scmp.com/rss",
  "South Africa": "https://www.iol.co.za/cmlink/1.640",
  "Australia": "https://www.news.com.au/feed",
  "Canada": "https://globalnews.ca/feed/"
};

function parseScore(raw) {
  return parseFloat(String(raw).replace(",", ".")) || 50;
}

function getOffset(score) {
  return (100 - score) * 0.002;
}

function measureTextWidth(text, font = "80px Nuances") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
}

function pxToEm(px, base = 80) {
  return (px / base).toFixed(2) + 'em';
}

async function fetchHeadline(feedUrl) {
  try {
    const response = await fetch(`http://localhost:3000/api/headline?url=${encodeURIComponent(feedUrl)}`);
    const data = await response.json();
    return data.title || "No headline available";
  } catch {
    return "Error loading headline";
  }
}

function injectDistortions(container, country, headline, scores) {
  container.innerHTML = "";

  INDICATORS.forEach(({ key, label, rotation }) => {
    const score = parseScore(scores[key]);


    const baseSize = 80;
    let adjustedSize = baseSize;
    
    if (headline.length > 120) {
      adjustedSize = 70;
    } else if (headline.length > 160) {
      adjustedSize = 60;
    }
    
    const text = new Blotter.Text(headline, {
      family: "Nuances",
      size: adjustedSize,
      fill: "#000",
      paddingTop: 60,
      paddingBottom: 60,
      paddingLeft: 150,
      paddingRight: 150
    });

    const material = new Blotter.ChannelSplitMaterial();
    material.uniforms.uOffset.value = getOffset(score);
    material.uniforms.uRotation.value = rotation;
    material.uniforms.uApplyBlur.value = 1.0;
    material.uniforms.uAnimateNoise.value = 1.0;

    const blotter = new Blotter(material, { texts: text });
    const scope = blotter.forText(text);

    const scrollBox = document.createElement("div");
    scrollBox.className = "scroll-box";
    scrollBox.style.visibility = "hidden"; // hide until we know its real width

    const linkWrapper = document.createElement("a");
    linkWrapper.href = "#";
    linkWrapper.target = "_blank";
    linkWrapper.rel = "noopener noreferrer";

    scope.appendTo(linkWrapper);
    scrollBox.appendChild(linkWrapper);

    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "score-display";
    scoreDisplay.textContent = `${country} — ${label}: ${score}`;

    document.body.appendChild(scrollBox); // temp append for rendering

    requestAnimationFrame(() => {
      const canvas = scrollBox.querySelector("canvas");
      if (canvas) {
        const actualWidth = canvas.width || canvas.getBoundingClientRect().width;
        const adjustedWidth = actualWidth + 500; // buffer for distortion
        scrollBox.style.width = adjustedWidth + "px";
        scrollBox.style.minWidth = adjustedWidth + "px";
      }

      scrollBox.style.visibility = "visible"; // reveal once sized
      container.appendChild(scrollBox);
      container.appendChild(scoreDisplay);
      document.body.removeChild(scrollBox); // clean up temp insert
    });
  });
}

async function renderAll() {
  const data = await fetch("data.json").then(res => res.json());
  const sections = document.querySelectorAll(".country-section");

  for (const section of sections) {
    const country = section.getAttribute("data-country");
    const feedUrl = rssFeeds[country];
    if (!feedUrl) continue;

    const record = data.find(entry => entry["Country_EN"] === country) || {};
    const scores = INDICATORS.reduce((acc, cur) => {
      acc[cur.key] = record[cur.key] || 50;
      return acc;
    }, {});

    const headline = await fetchHeadline(feedUrl);
    injectDistortions(section, country, headline, scores);
  }
}

renderAll();
setInterval(renderAll, 300000);

// Theme toggle logic
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".theme-toggle-btn");
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark") {
    document.body.classList.add("dark-mode");
    toggleBtn.classList.remove("theme-dark");
    toggleBtn.classList.add("theme-light");
  }

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    toggleBtn.classList.toggle("theme-dark", !isDark);
    toggleBtn.classList.toggle("theme-light", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});