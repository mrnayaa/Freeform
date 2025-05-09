const INDICATORS = [
  { key: "Score 2025", label: "Global Score", rotation: 0 },
  { key: "Political Context", label: "Political Indicator", rotation: 30 },
  { key: "Economic Context", label: "Economic Indicator", rotation: 60 },
  { key: "Legal Context", label: "Legislative Indicator", rotation: 80 },
  { key: "Social Context", label: "Sociocultural Indicator", rotation: 120 },
  { key: "Safety", label: "Security Indicator", rotation: 150 }
];

let countryData = [];

window.onload = async () => {
  const res = await fetch("data.json");
  countryData = await res.json();

  const countrySelect = document.querySelector(".country-select");
  countryData.forEach(country => {
    const option = document.createElement("option");
    option.value = country["Country_EN"];
    option.textContent = country["Country_EN"];
    countrySelect.appendChild(option);
  });

  document.querySelector(".font-slider").addEventListener("input", (e) => {
    const value = e.target.value;
    document.documentElement.style.setProperty("--font-multiplier", value);
    document.querySelectorAll(".blotter-output canvas").forEach(c => {
      c.style.transform = `scale(${value})`;
    });
  });

  document.querySelector(".visualize-btn").addEventListener("click", visualize);
  document.querySelector(".reset-btn").addEventListener("click", resetOutput);
};

const themeBtn = document.querySelector(".theme-toggle-btn");
themeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("theme-light");
  document.body.classList.toggle("theme-dark", !isLight);
  themeBtn.classList.toggle("theme-light", isLight);
  themeBtn.classList.toggle("theme-dark", !isLight);

  updateCanvasColor();
});

const ccBtn = document.querySelector(".uppercase-toggle-btn");
ccBtn.addEventListener("click", () => {
  const container = document.querySelector(".blotter-output-container");
  const isUpper = container.classList.toggle("uppercase-active");

  const text = document.querySelector(".text-input").value.trim();
  const country = document.querySelector(".country-select").value;

  if (!text || !country) return;

  const countryDataItem = countryData.find(c => c["Country_EN"] === country);
  const fillColor = "#000000";
  const scale = parseFloat(document.querySelector(".font-slider").value || "1");
  const transformedText = isUpper ? text.toUpperCase() : text;

  const outputContainer = document.querySelector(".blotter-output-container");
  outputContainer.innerHTML = "";

  INDICATORS.forEach(({ key, label, rotation }) => {
    const score = parseScore(countryDataItem[key]);
    const offset = getOffset(score);

    const textObj = new Blotter.Text(transformedText, {
      family: "Nuances",
      size: 80,
      fill: fillColor
    });

    const material = new Blotter.ChannelSplitMaterial();
    material.uniforms.uOffset.value = offset;
    material.uniforms.uRotation.value = rotation;
    material.uniforms.uApplyBlur.value = 1.0;
    material.uniforms.uAnimateNoise.value = 1.0;

    const blotter = new Blotter(material, { texts: textObj });
    const scope = blotter.forText(textObj);

    const block = document.createElement("div");
    block.className = "blotter-output";

    scope.appendTo(block);

    const labelEl = document.createElement("div");
    labelEl.className = "score-display";
    labelEl.textContent = `${label}: ${score.toFixed(2)}`;
    block.appendChild(labelEl);

    const canvas = block.querySelector("canvas");
    if (canvas) canvas.style.transform = `scale(${scale})`;

    outputContainer.appendChild(block);
  });
});

const panel = document.querySelector(".control-panel");
const toggle = document.querySelector(".panel-toggle");
const returnBtn = document.querySelector(".panel-return");

toggle.addEventListener("click", () => {
  panel.classList.add("hidden");
  toggle.classList.add("hidden");
  returnBtn.classList.remove("hidden");
});

returnBtn.addEventListener("click", () => {
  panel.classList.remove("hidden");
  toggle.classList.remove("hidden");
  returnBtn.classList.add("hidden");
});

function parseScore(raw) {
  return parseFloat(String(raw).replace(",", "."));
}

function getOffset(score) {
  return (100 - score) * 0.002;
}

function visualize() {
  const text = document.querySelector(".text-input").value.trim();
  const country = document.querySelector(".country-select").value;
  const outputContainer = document.querySelector(".blotter-output-container");
  const isUpper = outputContainer.classList.contains("uppercase-active");

  if (!text || !country) return;

  const countryDataItem = countryData.find(c => c["Country_EN"] === country);
  const fillColor = "#000000";
  const scale = parseFloat(document.querySelector(".font-slider").value || "1");
  const displayText = isUpper ? text.toUpperCase() : text;

  outputContainer.style.opacity = 0;
  outputContainer.innerHTML = "";

  setTimeout(() => {
    outputContainer.style.opacity = 1;

    INDICATORS.forEach(({ key, label, rotation }) => {
      const score = parseScore(countryDataItem[key]);
      const offset = getOffset(score);

      const textObj = new Blotter.Text(displayText, {
        family: "Nuances",
        size: 80,
        fill: fillColor
      });

      const material = new Blotter.ChannelSplitMaterial();
      material.uniforms.uOffset.value = offset;
      material.uniforms.uRotation.value = rotation;
      material.uniforms.uApplyBlur.value = 1.0;
      material.uniforms.uAnimateNoise.value = 1.0;

      const blotter = new Blotter(material, { texts: textObj });
      const scope = blotter.forText(textObj);

      const block = document.createElement("div");
      block.className = "blotter-output";

      scope.appendTo(block);

      const labelEl = document.createElement("div");
      labelEl.className = "score-display";
      labelEl.textContent = `${label}: ${score.toFixed(2)}`;
      block.appendChild(labelEl);

      const canvas = block.querySelector("canvas");
      if (canvas) canvas.style.transform = `scale(${scale})`;

      outputContainer.appendChild(block);
    });
  }, 10);
}

function updateCanvasColor() {
  const text = document.querySelector(".text-input").value.trim();
  const country = document.querySelector(".country-select").value;
  const outputContainer = document.querySelector(".blotter-output-container");
  const isUpper = outputContainer.classList.contains("uppercase-active");

  if (!text || !country) return;

  const countryDataItem = countryData.find(c => c["Country_EN"] === country);
  const fillColor = "#000000";
  const scale = parseFloat(document.querySelector(".font-slider").value || "1");
  const displayText = isUpper ? text.toUpperCase() : text;

  outputContainer.style.opacity = 0;
  outputContainer.innerHTML = "";

  setTimeout(() => {
    outputContainer.style.opacity = 1;

    INDICATORS.forEach(({ key, label, rotation }) => {
      const score = parseScore(countryDataItem[key]);
      const offset = getOffset(score);

      const textObj = new Blotter.Text(displayText, {
        family: "Nuances",
        size: 80,
        fill: fillColor
      });

      const material = new Blotter.ChannelSplitMaterial();
      material.uniforms.uOffset.value = offset;
      material.uniforms.uRotation.value = rotation;
      material.uniforms.uApplyBlur.value = 1.0;
      material.uniforms.uAnimateNoise.value = 1.0;

      const blotter = new Blotter(material, { texts: textObj });
      const scope = blotter.forText(textObj);

      const block = document.createElement("div");
      block.className = "blotter-output";

      scope.appendTo(block);

      const labelEl = document.createElement("div");
      labelEl.className = "score-display";
      labelEl.textContent = `${label}: ${score.toFixed(2)}`;
      block.appendChild(labelEl);

      const canvas = block.querySelector("canvas");
      if (canvas) canvas.style.transform = `scale(${scale})`;

      outputContainer.appendChild(block);
    });
  }, 10);
}

function resetOutput() {
  document.querySelector(".text-input").value = "Type here…";
  document.querySelector(".blotter-output-container").innerHTML = "";
  document.querySelector(".font-slider").value = 1;
  document.documentElement.style.setProperty("--font-multiplier", 1);
  document.querySelector(".blotter-output-container").classList.remove("uppercase-active");
}

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  direction: 'both',
  gestureDirection: 'both',
  smoothTouch: true,
  touchMultiplier: 2
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);