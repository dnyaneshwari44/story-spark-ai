import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Neural Network Canvas Background ─────────────────────────────────── */
function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    const PARTICLE_COUNT = 72;
    const CONNECTION_DIST = 160;
    const particles = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: rand(0, W), y: rand(0, H),
          vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
          r: rand(1.5, 3.5),
          pulse: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.01, 0.03),
          hue: Math.random() > 0.5 ? 185 : 260, // cyan or purple
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      // Animated grid
      const gridSize = 52;
      const offset = (t * 0.008) % gridSize;
      ctx.lineWidth = 0.4;
      for (let x = -gridSize + (offset % gridSize); x < W + gridSize; x += gridSize) {
        const alpha = 0.025 + 0.01 * Math.sin(t * 0.001 + x * 0.01);
        ctx.strokeStyle = `rgba(94,246,255,${alpha})`;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = -gridSize + (offset % gridSize); y < H + gridSize; y += gridSize) {
        const alpha = 0.025 + 0.01 * Math.sin(t * 0.001 + y * 0.01);
        ctx.strokeStyle = `rgba(94,246,255,${alpha})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Connections (glowing lines)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
            const mixHue = (particles[i].hue + particles[j].hue) / 2;
            const grd = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            grd.addColorStop(0, `hsla(${particles[i].hue},100%,70%,${alpha})`);
            grd.addColorStop(1, `hsla(${particles[j].hue},100%,70%,${alpha})`);
            ctx.lineWidth = 0.8 + (1 - dist / CONNECTION_DIST) * 1.2;
            ctx.strokeStyle = grd;
            // Glow
            ctx.shadowColor = `hsla(${mixHue},100%,70%,0.5)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Particles
      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const glow = 0.5 + 0.5 * Math.sin(p.pulse);
        const radius = p.r + glow * 1.5;

        // Outer glow ring
        const glowGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4);
        glowGrd.addColorStop(0, `hsla(${p.hue},100%,75%,${0.25 * glow})`);
        glowGrd.addColorStop(1, `hsla(${p.hue},100%,75%,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGrd;
        ctx.fill();

        // Core dot
        ctx.shadowColor = `hsla(${p.hue},100%,75%,0.9)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,80%,${0.7 + 0.3 * glow})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    animId = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => { resize(); initParticles(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function extractKeywords(text) {
  const common = new Set(["a","an","the","is","are","in","on","at","of","and","or","with","to","that","this","it","its","as","for","by","from","into","over","under","near","has","have","was","were","be","been","being","some","which","who","there","their","they","them","not","but","so","if","when","also"]);
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq = {};
  words.forEach(w => { if (!common.has(w)) freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060610;
    --surface: rgba(14,14,26,0.85);
    --surface2: rgba(22,22,38,0.9);
    --border: rgba(255,255,255,0.07);
    --border-glow: rgba(94,246,255,0.25);
    --accent: #5ef6ff;
    --accent2: #7c6aff;
    --accent3: #6affd4;
    --red: #ff6a9b;
    --text: #f0eff8;
    --muted: #6a697a;
    --glow: rgba(94,246,255,0.18);
    --glow2: rgba(124,106,255,0.18);
  }

  body {
    font-family: 'Syne', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Layout ── */
  .shell {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  /* ── Top bar ── */
  .topbar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 40px;
    border-bottom: 1px solid var(--border);
    background: rgba(6,6,16,0.6);
    backdrop-filter: blur(20px);
  }
  .topbar-logo {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .topbar-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent3);
    border: 1px solid rgba(106,255,212,0.2);
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(106,255,212,0.04);
  }
  .topbar-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
  }
  .status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent3);
    box-shadow: 0 0 8px var(--accent3);
    animation: statusPulse 2s ease-in-out infinite;
  }
  @keyframes statusPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

  /* ── Split layout ── */
  .split {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 0;
  }
  @media (max-width: 900px) {
    .split { grid-template-columns: 1fr; }
    .topbar { padding: 16px 20px; }
  }

  /* ── Left panel ── */
  .left-panel {
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 40px 36px;
    gap: 28px;
    background: rgba(6,6,16,0.4);
    backdrop-filter: blur(12px);
  }

  .panel-title {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .panel-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .upload-heading {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .upload-heading h2 {
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 800;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #fff 0%, var(--accent) 60%, var(--accent2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  .upload-heading h4 {
    font-size: clamp(17px, 3vw, 10px);
    font-weight: 800;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #902cb1 0%, var(--accent) 100%, var(--accent2) 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    
  }
  .upload-heading p {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--muted);
    font-weight: 300;
  }

  /* ── Dropzone ── */
  .dropzone {
    border: 1.5px dashed var(--border);
    border-radius: 18px;
    background: var(--surface);
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    min-height: 200px;
    backdrop-filter: blur(8px);
  }
  .dropzone::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(94,246,255,0.03), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .dropzone:hover::before, .dropzone.drag-over::before { opacity: 1; }
  .dropzone:hover, .dropzone.drag-over {
    border-color: var(--accent);
    border-style: solid;
    box-shadow: 0 0 0 1px rgba(94,246,255,0.1), 0 0 40px rgba(94,246,255,0.08), inset 0 0 40px rgba(94,246,255,0.02);
  }
  .dropzone.has-image {
    padding: 0;
    border-style: solid;
    border-color: var(--border-glow);
    min-height: 200px;
  }

  .dz-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: rgba(94,246,255,0.06);
    border: 1px solid rgba(94,246,255,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    transition: all 0.25s;
    position: relative;
    z-index: 1;
  }
  .dropzone:hover .dz-icon {
    background: rgba(94,246,255,0.12);
    transform: scale(1.06) translateY(-2px);
    box-shadow: 0 8px 24px rgba(94,246,255,0.15);
  }
  .dz-text { text-align: center; position: relative; z-index: 1; }
  .dz-text strong { display: block; font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .dz-text span { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--muted); }

  .preview-wrapper { position: relative; width: 100%; height: 100%; }
  .preview-img {
    width: 100%; max-height: 340px;
    object-fit: contain; border-radius: 16px; display: block;
  }
  .preview-overlay {
    position: absolute; top: 10px; right: 10px;
    display: flex; gap: 6px;
  }
  .preview-badge {
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 1.5px; text-transform: uppercase;
    background: rgba(6,6,16,0.75); border: 1px solid rgba(255,255,255,0.1);
    color: var(--accent3); padding: 4px 10px; border-radius: 20px;
    backdrop-filter: blur(8px);
  }
  .remove-btn {
    background: rgba(6,6,16,0.75); border: 1px solid rgba(255,255,255,0.1);
    color: var(--muted); width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px; backdrop-filter: blur(8px);
    transition: all 0.15s;
  }
  .remove-btn:hover { color: var(--accent2); border-color: var(--accent2); }

  /* ── URL input ── */
  .url-group { display: flex; flex-direction: column; gap: 6px; }
  .url-label {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
  }
  .url-input {
    padding: 11px 15px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    backdrop-filter: blur(8px);
    width: 100%;
  }
  .url-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(94,246,255,0.07);
  }
  .url-input::placeholder { color: var(--muted); }

  /* ── Buttons ── */
  .actions { display: flex; gap: 10px; }
  .btn-primary {
    flex: 1; padding: 14px 24px;
    border-radius: 12px; border: none;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 0.2px; cursor: pointer;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #060610;
    transition: all 0.2s;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 20px var(--glow);
  }
  .btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-primary:hover:not(:disabled)::after { opacity: 1; }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px var(--glow);
  }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }
  .btn-primary.is-loading {
    background: var(--surface2); color: var(--muted);
    pointer-events: none; box-shadow: none;
  }
  .btn-secondary {
    padding: 14px 18px; border-radius: 12px;
    border: 1px solid var(--border);
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; background: var(--surface); color: var(--muted);
    transition: all 0.2s; backdrop-filter: blur(8px);
  }
  .btn-secondary:hover {
    border-color: rgba(255,255,255,0.18);
    color: var(--text); background: var(--surface2);
  }

  .spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(10,10,20,0.3); border-top-color: #060610;
    border-radius: 50%; animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Right panel ── */
  .right-panel {
    display: flex;
    flex-direction: column;
    padding: 40px 36px;
    gap: 24px;
    background: rgba(6,6,16,0.25);
    backdrop-filter: blur(8px);
    overflow-y: auto;
  }

  /* ── Output card ── */
  .output-card {
    flex: 1;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
    transition: all 0.35s ease;
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
  }
  .output-card.is-done {
    border-color: rgba(94,246,255,0.2);
    box-shadow: 0 0 60px rgba(94,246,255,0.04), inset 0 1px 0 rgba(94,246,255,0.08);
  }
  .output-card.is-error { border-color: rgba(255,106,155,0.25); }

  .card-header {
    padding: 15px 22px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface2);
    flex-shrink: 0;
  }
  .card-header-left { display: flex; align-items: center; gap: 10px; }
  .status-indicator {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--muted); transition: all 0.3s;
  }
  .is-done .status-indicator { background: var(--accent3); box-shadow: 0 0 8px var(--accent3); }
  .is-error .status-indicator { background: var(--red); box-shadow: 0 0 8px var(--red); }
  .is-loading .status-indicator {
    background: var(--accent);
    animation: statusPulse 1s ease-in-out infinite;
  }
  .card-label {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
  }
  .card-model {
    font-family: 'DM Mono', monospace; font-size: 10px;
    color: rgba(255,255,255,0.15); letter-spacing: 1px;
  }

  .card-body {
    padding: 28px 24px;
    flex: 1;
    display: flex;
    align-items: flex-start;
    min-height: 180px;
  }

  .placeholder {
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: rgba(255,255,255,0.12); line-height: 1.7;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .placeholder-prompt {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  .prompt-line {
    height: 10px; border-radius: 6px;
    background: rgba(255,255,255,0.04);
    animation: breathe 3s ease-in-out infinite;
  }
  .prompt-line:nth-child(1) { width: 80%; animation-delay: 0s; }
  .prompt-line:nth-child(2) { width: 60%; animation-delay: 0.5s; }
  .prompt-line:nth-child(3) { width: 70%; animation-delay: 1s; }
  .prompt-line:nth-child(4) { width: 45%; animation-delay: 1.5s; }
  @keyframes breathe { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

  .shimmer-wrap { width: 100%; display: flex; flex-direction: column; gap: 12px; }
  .shimmer {
    height: 14px; border-radius: 7px;
    background: linear-gradient(90deg, var(--surface2) 25%, rgba(94,246,255,0.05) 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease infinite;
  }
  .shimmer:nth-child(2) { width: 78%; animation-delay: 0.1s; }
  .shimmer:nth-child(3) { width: 91%; animation-delay: 0.2s; }
  .shimmer:nth-child(4) { width: 65%; animation-delay: 0.3s; }
  @keyframes shimmer { to { background-position: -200% 0; } }

  .output-text {
    font-size: 15px; line-height: 1.8; color: var(--text);
    font-weight: 400; letter-spacing: 0.1px;
    animation: fadeSlide 0.4s ease;
  }
  .output-error {
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: var(--red); line-height: 1.7;
    animation: fadeSlide 0.3s ease;
  }
  @keyframes fadeSlide { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }

  .card-tags {
    padding: 0 24px 20px;
    display: flex; flex-wrap: wrap; gap: 7px;
  }
  .tag {
    font-family: 'DM Mono', monospace; font-size: 10px;
    padding: 3px 11px; border-radius: 20px;
    border: 1px solid rgba(94,246,255,0.15);
    color: var(--accent); background: rgba(94,246,255,0.04);
    letter-spacing: 0.5px;
    animation: fadeSlide 0.5s ease both;
  }

  .file-meta {
    font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted);
    display: flex; align-items: center; gap: 14px;
    padding: 11px 22px;
    border-top: 1px solid var(--border);
    background: var(--surface2);
    flex-shrink: 0;
  }
  .file-meta span { display: flex; align-items: center; gap: 5px; }

  /* ── Right stats / info blocks ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .info-block {
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 16px 18px;
    backdrop-filter: blur(8px);
    transition: border-color 0.3s;
  }
  .info-block:hover { border-color: rgba(94,246,255,0.15); }
  .info-block-label {
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
    margin-bottom: 6px;
  }
  .info-block-value {
    font-size: 20px; font-weight: 700;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .info-block-sub {
    font-family: 'DM Mono', monospace; font-size: 9px; color: var(--muted); margin-top: 2px;
  }

  /* ── Footer ── */
  .footer-bar {
    border-top: 1px solid var(--border);
    padding: 14px 40px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(6,6,16,0.5);
    backdrop-filter: blur(20px);
  }
  .footer-text {
    font-family: 'DM Mono', monospace; font-size: 10px;
    color: rgba(255,255,255,0.1); letter-spacing: 1px;
  }
  .footer-accent { color: rgba(94,246,255,0.3); }
`;

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function AIImagePredictor() {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState("");
  const [tags, setTags] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const inputRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX) { h *= MAX / w; w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setImage({ dataUrl, name: file.name, size: Math.round((dataUrl.length * 3) / 4), type: "image/jpeg" });
        setStatus("idle"); setResult(""); setTags([]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    let url = ollamaUrl.trim().replace(/\/$/, "");
    if (!url) { setResult("Please enter your Ollama connection URL."); setStatus("error"); return; }
    setStatus("loading"); setResult(""); setTags([]);
    try {
      const base64 = image.dataUrl.split(",")[1];
      const res = await fetch(`${url}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "moondream", prompt: "Describe this image in detail.", stream: false, images: [base64] }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const text = data.response || "";
      setResult(text); setTags(extractKeywords(text)); setStatus("done");
    } catch (err) {
      setResult(err.message || "Failed to connect to Ollama."); setStatus("error");
    }
  };

  const handleReset = () => { setImage(null); setStatus("idle"); setResult(""); setTags([]); };

  const cardClass = `output-card${status === "done" ? " is-done" : ""}${status === "error" ? " is-error" : ""}${status === "loading" ? " is-loading" : ""}`;

  return (
    <>
      <style>{STYLES}</style>
      <NeuralBackground />

      <div className="shell">
        {/* Top bar */}
        <header className="topbar">
          <span className="topbar-logo">⬡ VisionLocal</span>
          <span className="topbar-badge">Neural Vision Engine</span>
          <div className="topbar-status">
            <span className="status-dot" />
            <span>local inference</span>
          </div>
        </header>

        {/* Split layout */}
        <div className="split">

          {/* ── LEFT: Upload Panel ── */}
          <div className="left-panel">
            <span className="panel-title">Upload</span>

            <div className="upload-heading">
              <h2>Image Predictor</h2>
              <h4>Look Beyond Pixels</h4>
            </div>

            {/* Dropzone */}
            <div
              className={`dropzone${dragOver ? " drag-over" : ""}${image ? " has-image" : ""}`}
              onClick={() => !image && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {image ? (
                <div className="preview-wrapper">
                  <img src={image.dataUrl} alt="Preview" className="preview-img" />
                  <div className="preview-overlay">
                    <span className="preview-badge">ready</span>
                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="dz-icon">🤖</div>
                  <div className="dz-text">
                    <strong>Drop image here or click to browse</strong>
                    <span>Processes entirely on your device</span>
                  </div>
                </>
              )}
              <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            {/* URL input */}
            <div className="url-group">
              <label className="url-label">Ollama Endpoint</label>
              <input className="url-input" type="text" placeholder="http://localhost:11434"
                value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>

            {/* Actions */}
            <div className="actions">
              <button
                className={`btn-primary${status === "loading" ? " is-loading" : ""}`}
                disabled={!image || status === "loading"}
                onClick={handleAnalyze}
              >
                {status === "loading"
                  ? <><span className="spinner" />Inferring…</>
                  : "✦ Analyze Image"}
              </button>
              {image && <button className="btn-secondary" onClick={handleReset}>Reset</button>}
            </div>

            {/* Info blocks */}
            <div className="info-grid">
              <div className="info-block">
                <div className="info-block-label">Model</div>
                <div className="info-block-value" style={{ fontSize: 14 }}>moondream</div>
                <div className="info-block-sub">vision · local</div>
              </div>
              <div className="info-block">
                <div className="info-block-label">Engine</div>
                <div className="info-block-value" style={{ fontSize: 14 }}>Ollama</div>
                <div className="info-block-sub">ollama.com</div>
              </div>
              <div className="info-block">
                <div className="info-block-label">Privacy</div>
                <div className="info-block-value" style={{ fontSize: 14 }}>100%</div>
                <div className="info-block-sub">no cloud upload</div>
              </div>
              <div className="info-block">
                <div className="info-block-label">Max Size</div>
                <div className="info-block-value" style={{ fontSize: 14 }}>1024px</div>
                <div className="info-block-sub">auto-resized</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: AI Output Panel ── */}
          <div className="right-panel">
            <span className="panel-title">AI Output</span>

            <div className={cardClass} style={{ flex: 1 }}>
              <div className="card-header">
                <div className="card-header-left">
                  <span className="status-indicator" />
                  <span className="card-label">
                    {status === "loading" ? "Processing" : status === "done" ? "Description" : status === "error" ? "Error" : "Waiting"}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {status === "idle" && (
                  <div className="placeholder">
                    <div className="placeholder-prompt">
                      <div className="prompt-line" />
                      <div className="prompt-line" />
                      <div className="prompt-line" />
                      <div className="prompt-line" />
                    </div>
                  </div>
                )}
                {status === "loading" && (
                  <div className="shimmer-wrap">
                    <div className="shimmer" />
                    <div className="shimmer" />
                    <div className="shimmer" />
                    <div className="shimmer" />
                  </div>
                )}
                {status === "done" && <p className="output-text">{result}</p>}
                {status === "error" && <p className="output-error">⚠ {result}</p>}
              </div>

              {status === "done" && tags.length > 0 && (
                <div className="card-tags">
                  {tags.map((t, i) => (
                    <span key={i} className="tag" style={{ animationDelay: `${i * 0.07}s` }}>#{t}</span>
                  ))}
                </div>
              )}

              {image && status !== "idle" && (
                <div className="file-meta">
                  <span>📄 {image.name}</span>
                  <span>⚖ {formatBytes(image.size)}</span>
                  <span>🎨 {image.type.split("/")[1].toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer-bar">
          <span className="footer-text">powered by <span className="footer-accent">ollama</span> · local inference engine</span>
          <span className="footer-text">VisionLocal <span className="footer-accent">v2.0</span></span>
        </footer>
      </div>
    </>
  );
}