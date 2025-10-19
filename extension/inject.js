// Smart Element Context Picker — LLM-friendly output
(function() {
  if (window.__smartContextPickerActive) {
    console.log("Smart picker is already active. Run window.__stopSmartContextPicker() to stop it.");
    return;
  }
  window.__smartContextPickerActive = true;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, { position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:2147483647, pointerEvents:"none" });
  document.documentElement.appendChild(overlay);

  const highlight = document.createElement("div");
  Object.assign(highlight.style, {
    position:"absolute", background:"rgba(0,120,215,0.12)",
    outline:"2px solid rgba(0,120,215,0.9)", pointerEvents:"none"
  });
  overlay.appendChild(highlight);

  const info = document.createElement("div");
  Object.assign(info.style, {
    position:"fixed", right:"12px", bottom:"12px", padding:"8px 10px",
    background:"rgba(0,0,0,0.75)", color:"white", fontSize:"12px", borderRadius:"6px",
    zIndex:2147483648, pointerEvents:"auto"
  });
  info.textContent = "Hover and click to capture element context for LLM. Press ESC to exit.";
  document.body.appendChild(info);

  // --- helpers ---
  const visibleText = (n) => (n?.innerText || n?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const cs = window.getComputedStyle(el);
    return !(cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0" || (el.offsetWidth === 0 && el.offsetHeight === 0));
  };
  const nearestHeading = (el) => {
    const headers = ["H1","H2","H3","H4","H5","H6"];
    let cur = el;
    while (cur) {
      if (headers.includes(cur.tagName) && isVisible(cur)) return visibleText(cur);
      cur = cur.parentElement;
    }
    const p = el.parentElement;
    if (p) {
      const kids = [...p.children], idx = kids.indexOf(el);
      for (let d = 1; d <= Math.max(idx, kids.length - idx - 1); d++) {
        const prev = kids[idx - d], next = kids[idx + d];
        if (prev && headers.includes(prev.tagName) && isVisible(prev)) return visibleText(prev);
        if (next && headers.includes(next.tagName) && isVisible(next)) return visibleText(next);
      }
    }
    return "";
  };
  const siblingBlocks = (el, limit=400) => {
    const isBlock = (t) => /^(DIV|SECTION|ARTICLE|P|LI|MAIN|ASIDE|HEADER|FOOTER|NAV|TD|TH)$/i.test(t);
    let block = el;
    while (block && !isBlock(block.tagName)) block = block.parentElement;
    if (!block) block = el.parentElement;
    if (!block) return { prev:"", next:"" };
    const sibs = [...(block.parentElement?.children || [block])], idx = sibs.indexOf(block);
    const prev = sibs.slice(0, idx).reverse().map(visibleText).filter(Boolean).join(" ").slice(0, limit);
    const next = sibs.slice(idx+1).map(visibleText).filter(Boolean).join(" ").slice(0, limit);
    return { prev, next };
  };
  const ancestorText = (el) => {
    const out = []; let cur = el.parentElement; let depth = 0;
    while (cur && depth < 3) { const t = visibleText(cur); if (t) out.push(t.slice(0,120)); cur = cur.parentElement; depth++; }
    return out.join(" — ");
  };
  const cssPath = (el) => {
    if (!el) return "";
    const parts = [];
    for (let cur = el; cur && cur.tagName !== "HTML"; cur = cur.parentElement) {
      let part = cur.tagName.toLowerCase();
      if (cur.id) { part += "#" + cur.id; parts.unshift(part); break; }
      const p = cur.parentElement;
      if (p) {
        const same = [...p.children].filter(c => c.tagName === cur.tagName);
        if (same.length > 1) {
          const idx = [...p.children].indexOf(cur) + 1;
          part += `:nth-child(${idx})`;
        }
      }
      parts.unshift(part);
    }
    return parts.join(" > ");
  };

  // --- main collector ---
  function collectForLLM(el) {
    const data = {
      page: {
        title: document.title,
        url: window.location.href,
        capturedAt: new Date().toISOString()
      },
      element: {
        text: visibleText(el) || null,
        htmlSnippet: (el.outerHTML || "").trim().slice(0, 2000),
        cssPath: cssPath(el),
        tagName: el.tagName,
        id: el.id || null,
        classList: [...(el.classList || [])]
      },
      context: {
        nearestHeading: nearestHeading(el) || null,
        previousBlock: siblingBlocks(el).prev || null,
        nextBlock: siblingBlocks(el).next || null,
        ancestorSummary: ancestorText(el) || null
      }
    };
    return data;
  }

  // --- mouse highlight ---
  let lastEl = null;
  function onMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || overlay.contains(el) || el === info || el === highlight) {
      highlight.style.width = "0px"; highlight.style.height = "0px"; lastEl = null; return;
    }
    if (el !== lastEl) lastEl = el;
    const r = el.getBoundingClientRect();
    Object.assign(highlight.style, {
      left: (r.left + window.scrollX) + "px",
      top: (r.top + window.scrollY) + "px",
      width: r.width + "px", height: r.height + "px"
    });
  }

  async function onClick(e) {
    e.preventDefault(); e.stopPropagation();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || overlay.contains(el) || el === info || el === highlight) return;
    info.textContent = "Collecting element context...";
    const llmData = collectForLLM(el);
    window.__lastPickedElement = llmData;  // stored globally for later use
    console.log("✅ Captured element context (for LLM):", llmData);
    info.textContent = "Captured. Check console (window.__lastPickedElement). Press ESC to exit or click another element.";

    // OPTIONAL: send automatically to your backend
    // fetch("https://your-server.com/api/element", {
    //   method: "POST",
    //   headers: {"Content-Type":"application/json"},
    //   body: JSON.stringify(llmData)
    // });
  }

  function onKey(e) { if (e.key === "Escape") stopPicker("User pressed ESC"); }
  function stopPicker(reason) {
    window.__smartContextPickerActive = false;
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    overlay.remove(); info.remove();
    console.log("Smart context picker stopped:", reason);
  }
  window.__stopSmartContextPicker = stopPicker;

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);

  console.log("Smart LLM context picker started. Hover and click any element to capture its structured context. Press ESC to stop.");
})();
