(async () => {
  const escape = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const response = await fetch("slides.json");
  if (!response.ok) throw new Error("Could not load the presentation.");
  const slides = await response.json();
  const container = document.querySelector("#slides");
  const stage = document.querySelector("#stage");
  let index = 0;
  let build = 0;
  const eyebrow = (text) =>
    `<div class="eyebrow"><span class="dot"></span>${escape(text)}</div>`;
  // Message text follows the formats in droid-telegram-bot's bot.py.
  const telegram = (label) =>
    `<div class="tg" role="img" aria-label="${escape(label)}"><div class="tg-head"><span class="tg-avatar">D</span><span><strong>Droid</strong><small>bot</small></span></div><div class="tg-chat"><p class="tg-msg out">Why does the login test fail?</p><p class="tg-msg in">Working... (continuing)<br><br>→ Grep: 'expiresAt'<br>→ Read: src/auth/session.ts<br>→ Execute: npm test -- login</p><p class="tg-msg in">The token check compares seconds with milliseconds. I changed <code>isExpired()</code> to use seconds, and the login test passes.</p></div></div>`;
  function body(slide) {
    if (slide.kind === "instrument")
      return `${eyebrow(slide.chapter)}<h2>${escape(slide.title)}</h2><div class="plant-slide"><div class="plant-frame" data-instrument="${escape(slide.instrument)}"><iframe src="plant/${escape(slide.instrument)}-bay.html?embed" title="${escape(slide.figure)}" loading="lazy"></iframe></div></div>`;
    if (slide.kind === "section")
      return `${eyebrow(`Section ${slide.number} / 06`)}<div class="section-heading"><span class="section-number" aria-hidden="true">${escape(slide.number)}</span><h2>${escape(slide.title)}</h2><p class="section-summary">${escape(slide.summary)}</p></div><p class="section-call">${escape(slide.call)}</p><div class="section-settings">${slide.cards.map(([title, copy]) => `<div><h3>${escape(title)}</h3><p>${escape(copy)}</p></div>`).join("")}</div>`;
    if (slide.kind === "cover")
      return `<img class="logo" src="assets/factory-lockup-white.svg" alt="Factory"><div class="cover-copy">${eyebrow(slide.chapter)}<h1>${escape(slide.title)}</h1><p class="subtitle">${escape(slide.subtitle)}</p></div>${slide.credits ? `<a class="cover-qr" href="${escape(slide.credits.url)}" rel="noopener"><span class="qr-card"><img src="${escape(slide.credits.qr)}" alt="QR code: ${escape(slide.credits.caption)}"></span><span class="cover-qr-caption">${escape(slide.credits.caption)}</span></a>` : `<div class="hero-mark" aria-hidden="true"><img src="assets/rotor-white.svg" alt=""></div>`}<div class="cover-bottom"><span><strong>${escape(slide.presenter[0])}</strong> / ${escape(slide.presenter[1])}</span><span>${escape(slide.meta)}</span></div>`;
    let html = `${eyebrow(slide.chapter)}<h2>${escape(slide.title)}</h2>`;
    if (slide.signature)
      html += `<p class="signature">${escape(slide.signature)}</p>`;
    if (slide.kind === "code") {
      const lines = slide.excerpt.split("\n");
      const legend = slide.streams
        ? `<span class="stream-legend">${Object.entries(slide.streams)
            .map(([name, copy]) => `<span class="stream ${name}">${name}</span>${escape(copy)}`)
            .join("")}</span>`
        : "";
      const density = lines.length > 17 ? "long" : lines.length > 16 ? "dense" : "";
      html += `<div class="code-layout${slide.points.length > 3 ? " four-points" : ""}"><div><div class="code-window"><div class="code-header"><span class="filename"><span class="lights" aria-hidden="true">•••</span>${escape(slide.file)}</span>${legend}</div><pre class="${density}${slide.wrap ? " wrap" : ""}" tabindex="0" role="region" aria-label="${slide.language === "bash" ? "Shell" : slide.language === "json" ? "JSON" : "TypeScript"} code example"><code>${lines
        .map((line, i) => {
          const groups = slide.points.flatMap((p, n) =>
            p[1].some((needle) => line.includes(needle)) ? [n + 1] : [],
          );
          const stream = slide.dirs ? `<span class="stream ${slide.dirs[i]}">${slide.dirs[i]}</span>` : "";
          return `<span class="code-line" data-groups="${groups.join(",")}"><span class="line-number" aria-hidden="true">${slide.lineNumbers[i]}</span>${stream}<span class="code-text">${slide.highlightedLines?.[i] ?? (escape(line) || " ")}</span></span>`;
        })
        .join(
          "",
        )}</code></pre></div>${slide.downloads ? `<div class="downloads"><span class="downloads-label">${escape(slide.downloads.label)}</span>${slide.downloads.links.map(([name, url]) => `<a href="${escape(url)}" rel="noopener">${escape(name)} ↓</a>`).join("")}</div>` : ""}</div><aside class="points" aria-label="Code walkthrough">${slide.points.map((p, n) => `<button class="point" data-build="${n + 1}" aria-pressed="false"><span class="point-head"><span class="point-num">0${n + 1}</span>${escape(p[0])}</span><p>${escape(p[2])}</p></button>`).join("")}</aside></div>`;
    } else if (slide.kind === "daemon-definition" || slide.kind === "browser") {
      html += `<p class="daemon-lede">${escape(slide.lede)}</p>${slide.command ? `<p class="signature daemon-command">${escape(slide.command)}</p>` : ""}<div class="daemon-flow">${slide.cards.map(([title, copy], i) => `<div class="daemon-card"><div class="label">0${i + 1}</div><h3>${escape(title)}</h3><p>${escape(copy)}</p></div>`).join('<div class="flow-arrow" aria-hidden="true">→</div>')}</div><p class="notice">${escape(slide.notice)}</p>`;
    } else if (slide.kind === "lifecycle" || slide.kind === "topics") {
      html += `<div class="topic-grid ${slide.kind === "lifecycle" ? "lifecycle-grid" : ""}">${slide.cards.map(([title, copy]) => `<div class="topic-card"><h3>${escape(title)}</h3><p>${escape(copy)}</p></div>`).join("")}</div>${slide.notice ? `<p class="notice">${escape(slide.notice)}</p>` : ""}`;
    } else if (slide.kind === "showcase") {
      const shot = (s) =>
        s.mock === "telegram"
          ? telegram(s.alt)
          : `<img src="${escape(s.src)}" alt="${escape(s.alt)}" loading="lazy" class="${s.fit === "contain" ? "contain" : ""}">`;
      if (slide.community) {
        html += `<div class="community-grid">${slide.shots.map((s) => `<figure class="shot-card"><div class="shot">${shot(s)}</div><figcaption><span class="shot-name">${escape(s.name)}</span>${escape(s.caption)}</figcaption></figure>`).join("")}</div><div class="use-row">${slide.uses.map(([title, copy]) => `<div><h3>${escape(title)}</h3><p>${escape(copy)}</p></div>`).join("")}</div>`;
      } else {
        html += `<div class="showcase-layout"><div class="shots shots-${slide.shots.length}">${slide.shots.map((s) => `<div class="shot">${shot(s)}</div>`).join("")}</div><aside class="showcase-copy"><p class="via">${escape(slide.via)}</p>${slide.details.map(([title, copy]) => `<div><h3>${escape(title)}</h3><p>${escape(copy)}</p></div>`).join("")}<p class="credit">${escape(slide.credit)}</p></aside></div>`;
      }    } else if (slide.kind === "qr") {
      html += `<div class="qr-layout"><div class="qr-copy"><p class="qr-lede">${escape(slide.lede)}</p><a class="qr-url" href="${escape(slide.url)}" rel="noopener">${escape(slide.display)}</a></div><div class="qr-card"><img src="${escape(slide.qr)}" alt="QR code for ${escape(slide.url)}"></div></div>`;
    } else if (slide.kind === "close") {
      html += `<div class="links">${slide.links.map(([label, title, url]) => `<div><div class="label">${escape(label)}</div><p class="link-title">${escape(title)}</p><p class="link-url">${escape(url)}</p></div>`).join("")}</div>${slide.handle ? `<p class="handle">${escape(slide.handle)}</p>` : ""}`;
    }
    return html;
  }
  container.innerHTML = slides
    .map(
      (slide, i) =>
        `<section class="slide ${slide.kind}${slide.signature ? " has-signature" : ""}" data-theme="dark" aria-label="Slide ${i + 1}: ${escape(slide.title)}" aria-hidden="true" inert>${body(slide)}</section>`,
    )
    .join("");
  const sections = [...container.children];
  // Each bay runs in its own iframe; it plays only while its slide is active.
  const plants = [...container.querySelectorAll(".plant-frame iframe")].map(
    (frame) => ({ frame, slide: sections.indexOf(frame.closest(".slide")) }),
  );
  function fitPlant(plant) {
    if (!plant.size) return;
    const box = plant.frame.parentElement;
    const row = box.parentElement;
    const scale = Math.min(
      row.clientWidth / plant.size.width,
      box.clientHeight / plant.size.height,
    );
    if (!(scale > 0)) return;
    box.style.width = `${plant.size.width * scale}px`;
    Object.assign(plant.frame.style, {
      width: `${plant.size.width}px`,
      height: `${plant.size.height}px`,
      transform: `scale(${scale})`,
    });
  }
  function syncPlants() {
    for (const plant of plants) {
      const on = plant.slide === index;
      if (on) fitPlant(plant);
      if (plant.ready && plant.on !== on) {
        plant.on = on;
        plant.frame.contentWindow.postMessage(
          { plant: true, type: "active", on },
          "*",
        );
      }
    }
  }
  addEventListener("message", (event) => {
    const plant = plants.find((p) => p.frame.contentWindow === event.source);
    if (!plant || !event.data?.plant) return;
    if (event.data.type === "size") {
      plant.size = event.data;
      fitPlant(plant);
    } else if (event.data.type === "ready") {
      plant.ready = true;
      plant.on = undefined;
      syncPlants();
    } else if (event.data.type === "key" && plant.slide === index)
      command(event.data.key);
  });
  const fit = () =>
    stage.style.setProperty(
      "--scale",
      Math.min(innerWidth / 1920, innerHeight / 1080),
    );
  function go(next, step = 0, updateHash = true) {
    index = Math.max(
      0,
      Math.min(slides.length - 1, Number.isFinite(next) ? next : 0),
    );
    build = Math.max(
      0,
      Math.min(
        slides[index].points?.length ?? 0,
        Number.isFinite(step) ? step : 0,
      ),
    );
    sections.forEach((section, i) => {
      section.classList.toggle("active", index === i);
      section.setAttribute("aria-hidden", String(index !== i));
      section.inert = index !== i;
    });
    syncPlants();
    sections[index].querySelectorAll(".code-line").forEach((line) => {
      const focused =
        build > 0 && line.dataset.groups.split(",").includes(String(build));
      line.classList.toggle("focus", focused);
      line.classList.toggle("muted", build > 0 && !focused);
    });
    sections[index].querySelectorAll(".point").forEach((point) => {
      point.classList.toggle("active", Number(point.dataset.build) === build);
      point.setAttribute(
        "aria-pressed",
        String(Number(point.dataset.build) === build),
      );
    });
    document.querySelector("#chapter").textContent = slides[index].chapter;
    document.querySelector("#counter").textContent =
      `${String(index + 1).padStart(2, "0")} / ${slides.length}`;
    document.querySelector("#progress").style.width =
      `${(100 * (index + 1)) / slides.length}%`;
    document.querySelector("#previous").disabled = index === 0 && build === 0;
    document.querySelector("#next").disabled =
      index === slides.length - 1 &&
      build === (slides[index].points?.length ?? 0);
    document.querySelector("#announcement").textContent =
      `Slide ${index + 1}. ${slides[index].title}${build ? ` Highlight ${build}: ${slides[index].points[build - 1][0]}.` : ""}`;
    if (updateHash) history.replaceState(null, "", `#/${index + 1}/${build}`);
  }
  const next = () =>
    build < (slides[index].points?.length ?? 0)
      ? go(index, build + 1)
      : go(index + 1);
  const previous = () =>
    build > 0
      ? go(index, build - 1)
      : go(index - 1, slides[index - 1]?.points?.length ?? 0);
  function fromHash() {
    const match = location.hash.match(/^#\/(\d+)(?:\/(\d+))?$/);
    go(match ? Number(match[1]) - 1 : 0, match ? Number(match[2] || 0) : 0);
  }
  document.querySelector("#next").addEventListener("click", next);
  document.querySelector("#previous").addEventListener("click", previous);
  container.addEventListener("click", (event) => {
    const point = event.target.closest("[data-build]");
    if (point) go(index, Number(point.dataset.build));
  });
  addEventListener("keydown", (event) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.repeat ||
      event.target.closest("[data-instrument]")
    )
      return;
    if (
      ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(
        document.activeElement.tagName,
      ) &&
      [" ", "Enter"].includes(event.key)
    )
      return;
    if (command(event.key)) event.preventDefault();
  });
  function command(key) {
    if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(key)) next();
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(key)) previous();
    else if (key === "Home") go(0);
    else if (key === "End") go(slides.length - 1);
    else return false;
    return true;
  }
  let touchX;
  stage.addEventListener(
    "touchstart",
    (event) => {
      touchX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - touchX;
      if (
        Math.abs(delta) > 60 &&
        !event.target.closest("pre, [data-instrument]")
      )
        delta < 0 ? next() : previous();
    },
    { passive: true },
  );
  addEventListener("hashchange", fromHash);
  addEventListener("resize", fit);
  window.Workshop = {
    go,
    next,
    previous,
    slides,
    get state() {
      return { index, build };
    },
  };
  fit();
  fromHash();
})().catch((error) => {
  document.querySelector("#slides").innerHTML =
    '<section class="slide active"><h1>The presentation could not load.</h1><p>Reload the page.</p></section>';
  console.error(error);
});
