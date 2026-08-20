import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * LUNRAYBEE — a fictional, tongue-in-cheek "creator" landing page.
 * Not modeled on any real person. Illustrated mood cards instead of photos.
 */

const MOODS = [
  { mood: "smug", tag: "unbothered", grad: "linear-gradient(135deg,#ff5d73,#ffb37a)" },
  { mood: "feral", tag: "unhinged", grad: "linear-gradient(135deg,#9b7bff,#5d5dff)" },
  { mood: "melt", tag: "buffering", grad: "linear-gradient(135deg,#c6ff5e,#4fd1a5)" },
];

function Mascot({ mood, size = 64 }) {
  const gid = `lrb-g-${mood}`;
  const stops = {
    smug: ["#ff8a65", "#ff5d73"],
    feral: ["#b79bff", "#5d5dff"],
    melt: ["#d8ff8f", "#4fd1a5"],
  }[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="100%" stopColor={stops[1]} />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="60" rx="33" ry="28" fill={`url(#${gid})`} />
      <rect x="17" y="54" width="66" height="9" fill="#14101f" opacity="0.16" />
      <path
        d="M64 20 a13 13 0 1 0 8 21 a9 9 0 1 1 -8 -21 z"
        fill="#ffd23f"
      />
      <line x1="36" y1="34" x2="31" y2="16" stroke="#14101f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="31" cy="14" r="4" fill="#ffd23f" />

      {mood === "smug" && (
        <>
          <path d="M31 54 q6 -7 12 0" stroke="#14101f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <circle cx="63" cy="54" r="3.2" fill="#14101f" />
          <path d="M34 74 q16 11 32 0" stroke="#14101f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "feral" && (
        <>
          <circle cx="38" cy="54" r="7" fill="#fff" />
          <circle cx="39" cy="53" r="2.8" fill="#14101f" />
          <circle cx="64" cy="54" r="7" fill="#fff" />
          <circle cx="65" cy="53" r="2.8" fill="#14101f" />
          <path d="M32 74 q18 16 36 0 q-4 10 -18 10 q-14 0 -18 -10 z" fill="#14101f" />
        </>
      )}
      {mood === "melt" && (
        <>
          <path d="M31 50 l11 11 M42 50 l-11 11" stroke="#14101f" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M57 50 l11 11 M68 50 l-11 11" stroke="#14101f" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M36 76 q14 -8 28 0" stroke="#14101f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

const STATS = [
  { n: "2.3M", l: "Views Farmed" },
  { n: "0", l: "Apologies Issued" },
  { n: "14", l: "Ring Lights Destroyed" },
  { n: "1", l: "Personality (shared across all videos)" },
];

const TIMELINE = [
  {
    tag: "6 AM",
    title: "Wakes up already correct",
    body: "No alarm. No skincare routine. Just vibes and an unshakeable belief that the algorithm personally owes him something.",
  },
  {
    tag: "NOON",
    title: "Films 40 minutes, keeps 12 seconds",
    body: "The other 39:48 becomes 'unreleased footage' — a phrase doing the heavy lifting of an entire archive.",
  },
  {
    tag: "3 PM",
    title: "Googles himself, regrets it instantly",
    body: "Finds a comment from 2022 he still hasn't recovered from. Reads it 4 more times to be sure.",
  },
  {
    tag: "6 PM",
    title: "Wins an argument with a stranger",
    body: "Screenshots it. Frames it. It now outranks his diploma on the living room wall.",
  },
  {
    tag: "12 AM",
    title: "Uploads, deletes the tweet, re-uploads",
    body: "Thumbnail displays 3 emotions, none of which technically occurred during filming.",
  },
];

const COMMENTS = [
  { u: "@ex_believer_2011", t: "not me setting a 9pm reminder to be disappointed on schedule", v: 812 },
  { u: "@your.moms.fav.editor", t: "he said 'trust the process' and the process filed a restraining order", v: 2400 },
  { u: "@low_effort_high_reward", t: "the confidence of a man who has never once been correct", v: 991 },
  { u: "@algorithm_hostage", t: "I click because I'm contractually obligated at this point, send help", v: 1560 },
  { u: "@subscribed_by_accident", t: "the thumbnail lied to me and somehow I still respect it", v: 640 },
  { u: "@notifications_regret", t: "watched the whole thing standing up out of pure disrespect", v: 305 },
];

function useSiren(active) {
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const rafRef = useRef(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try {
      if (gainRef.current && ctxRef.current) {
        const now = ctxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setTargetAtTime(0, now, 0.05);
      }
      if (oscRef.current) oscRef.current.stop(ctxRef.current.currentTime + 0.2);
    } catch (e) {}
    setTimeout(() => {
      try {
        if (ctxRef.current) ctxRef.current.close();
      } catch (e) {}
      ctxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
    }, 250);
  }, []);

  useEffect(() => {
    if (!active) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.08);

    ctxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;

    const sweep = () => {
      const t = ctx.currentTime;
      const phase = (t % 1.4) / 1.4;
      const freq = 500 + Math.abs(Math.sin(phase * Math.PI * 2)) * 650;
      osc.frequency.setValueAtTime(freq, t);
      rafRef.current = requestAnimationFrame(sweep);
    };
    sweep();

    return () => stop();
  }, [active, stop]);

  return stop;
}

export default function Lunraybee() {
  const [chaos, setChaos] = useState(false);
  const [flash, setFlash] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const stopSiren = useSiren(chaos);
  const autoStopRef = useRef(null);

  useEffect(() => {
    let t;
    if (chaos) {
      const tick = () => {
        setFlash((f) => !f);
        t = setTimeout(tick, 90 + Math.random() * 60);
      };
      tick();
      autoStopRef.current = setTimeout(() => setChaos(false), 9000);
    } else {
      setFlash(false);
    }
    return () => {
      clearTimeout(t);
      clearTimeout(autoStopRef.current);
    };
  }, [chaos]);

  const endChaos = () => {
    setChaos(false);
    stopSiren();
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap');

        * { box-sizing: border-box; }
        .lrb-wrap {
          font-family: 'Space Grotesk', sans-serif;
          background: #0e0a1a;
          color: #f6f3ff;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }
        .lrb-display { font-family: 'Fredoka', sans-serif; letter-spacing: -0.01em; }

        .lrb-glow-a {
          position: absolute; top: -120px; left: -100px; width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(255,93,115,0.25), transparent 65%);
          filter: blur(10px); z-index: 0; pointer-events: none;
        }
        .lrb-glow-b {
          position: absolute; top: 200px; right: -140px; width: 460px; height: 460px;
          background: radial-gradient(circle, rgba(155,123,255,0.22), transparent 65%);
          filter: blur(10px); z-index: 0; pointer-events: none;
        }

        .lrb-nav {
          position: sticky; top: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 6vw;
          background: rgba(14,10,26,0.78);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(246,243,255,0.08);
        }
        .lrb-logo { font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .lrb-logo-badge {
          width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg,#ff5d73,#9b7bff); font-size: 15px; flex-shrink: 0;
        }
        .lrb-logo span { color: #ff5d73; }
        .lrb-navlinks { display: flex; gap: 26px; font-size: 14px; color: #a89fc2; }
        .lrb-navlinks span:hover { color: #f6f3ff; cursor: default; }
        .lrb-btn {
          border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; border-radius: 999px; padding: 12px 24px; font-size: 13.5px;
          background: linear-gradient(120deg,#ff5d73,#ff8a65); color: #14101f;
          transition: transform .15s ease, box-shadow .15s ease; white-space: nowrap;
        }
        .lrb-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(255,93,115,0.35); }
        .lrb-btn.ghost { background: transparent; color: #f6f3ff; border: 1px solid rgba(246,243,255,0.25); }
        .lrb-burger {
          display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px;
        }
        .lrb-burger span { width: 22px; height: 2px; background: #f6f3ff; border-radius: 2px; }
        .lrb-mobile-menu {
          display: none; flex-direction: column; gap: 4px; padding: 14px 6vw 18px;
          background: rgba(14,10,26,0.98); border-bottom: 1px solid rgba(246,243,255,0.08);
        }
        .lrb-mobile-menu.open { display: flex; }
        .lrb-mobile-menu span { padding: 10px 4px; font-size: 15px; color: #cfc7e6; border-bottom: 1px solid rgba(246,243,255,0.06); }

        .lrb-hero { position: relative; padding: 8vw 6vw 4vw; z-index: 2; }
        .lrb-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #ffd23f; border: 1px solid rgba(255,210,63,0.35); border-radius: 999px;
          padding: 6px 14px; margin-bottom: 20px;
        }
        .lrb-dot { width: 6px; height: 6px; border-radius: 50%; background: #ffd23f; animation: pulse 1.4s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }

        .lrb-mood-row { display: flex; gap: 18px; margin-bottom: 40px; flex-wrap: wrap; }
        .lrb-mood-card {
          width: 148px; aspect-ratio: 3/4; border-radius: 20px; padding: 14px;
          display: flex; flex-direction: column; justify-content: space-between;
          box-shadow: 0 16px 30px rgba(0,0,0,0.35); border: 3px solid #0e0a1a;
          transition: transform .25s ease;
        }
        .lrb-mood-card:nth-child(1) { transform: rotate(-6deg); }
        .lrb-mood-card:nth-child(2) { transform: rotate(3deg) translateY(-10px); }
        .lrb-mood-card:nth-child(3) { transform: rotate(-2deg); }
        .lrb-mood-card:hover { transform: rotate(0deg) translateY(-6px) scale(1.04); }
        .lrb-mood-icon { display: block; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.3)); }
        .lrb-mood-icon svg { width: 100%; height: auto; max-width: 64px; }
        .lrb-mood-tag {
          font-size: 12px; font-weight: 700; background: rgba(14,10,26,0.55);
          border-radius: 8px; padding: 6px 8px; align-self: flex-start; backdrop-filter: blur(3px);
        }

        .lrb-title {
          font-size: clamp(46px, 8.6vw, 118px); line-height: 0.95; margin: 0; font-weight: 700;
        }
        .lrb-title .hl {
          background: linear-gradient(100deg, #ff5d73 20%, #ffd23f 50%, #9b7bff 80%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 220% auto; animation: sheen 6s linear infinite;
        }
        @keyframes sheen { 0% { background-position: 0% 50%; } 100% { background-position: 220% 50%; } }

        .lrb-sub { font-size: clamp(15px, 1.3vw, 18px); color: #b8b0d4; max-width: 52ch; margin: 22px 0 30px; line-height: 1.6; }
        .lrb-cta-row { display: flex; gap: 14px; flex-wrap: wrap; }

        .lrb-ticker {
          position: relative; z-index: 2; border-top: 1px solid rgba(246,243,255,0.08);
          border-bottom: 1px solid rgba(246,243,255,0.08); padding: 14px 0; overflow: hidden;
          background: rgba(255,93,115,0.06); margin-top: 50px;
        }
        .lrb-ticker-track {
          display: flex; gap: 50px; white-space: nowrap; animation: scroll 20s linear infinite;
          font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: #a89fc2;
        }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .lrb-stats {
          position: relative; z-index: 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
          background: rgba(246,243,255,0.08); margin: 50px 6vw 0; border-radius: 20px; overflow: hidden;
        }
        .lrb-stat { background: #14101f; padding: 30px 16px; text-align: center; }
        .lrb-stat .n { font-size: clamp(24px, 3.2vw, 40px); font-family: 'Fredoka', sans-serif; font-weight: 700; color: #ff5d73; }
        .lrb-stat .l { font-size: 11.5px; color: #8b83a6; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; }

        .lrb-section { position: relative; z-index: 2; padding: 8vw 6vw; }
        .lrb-heading { font-size: clamp(28px, 3.6vw, 46px); margin: 0 0 10px; font-weight: 700; }
        .lrb-kicker { color: #ff5d73; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 12px; display: block; font-weight: 700; }
        .lrb-section-sub { color: #8b83a6; max-width: 60ch; margin-bottom: 44px; font-size: 14.5px; }

        .lrb-timeline { display: flex; flex-direction: column; }
        .lrb-tl-row {
          display: grid; grid-template-columns: 90px 1fr; gap: 24px;
          padding: 26px 0; border-top: 1px solid rgba(246,243,255,0.08); transition: background .2s ease;
        }
        .lrb-tl-row:hover { background: rgba(255,93,115,0.04); }
        .lrb-tl-row:last-child { border-bottom: 1px solid rgba(246,243,255,0.08); }
        .lrb-tl-tag {
          font-size: 12px; font-weight: 700; color: #ffd23f; padding-top: 4px;
        }
        .lrb-tl-title { font-size: 19px; margin: 0 0 8px; font-weight: 700; }
        .lrb-tl-body { color: #a89fc2; font-size: 14px; line-height: 1.6; max-width: 60ch; }

        .lrb-climax {
          text-align: center; padding: 9vw 6vw; position: relative; z-index: 2;
          background: radial-gradient(ellipse at 50% 30%, rgba(255,93,115,0.16), transparent 60%);
        }
        .lrb-climax-word { font-size: clamp(42px, 11vw, 148px); margin: 0; font-weight: 700; text-shadow: 0 0 40px rgba(255,93,115,0.45); }
        .lrb-climax-sub { color: #b8b0d4; max-width: 50ch; margin: 20px auto 0; font-size: 15px; }

        .lrb-comments { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .lrb-comment {
          background: #14101f; border: 1px solid rgba(246,243,255,0.08); border-radius: 16px;
          padding: 20px; font-size: 14px; line-height: 1.55;
        }
        .lrb-comment .u { color: #ffd23f; font-size: 12.5px; margin-bottom: 8px; display: block; font-weight: 700; }
        .lrb-comment .v { color: #6d6485; font-size: 12px; margin-top: 12px; }

        .lrb-egg-section { text-align: center; padding: 9vw 6vw 11vw; position: relative; z-index: 2; }
        .lrb-egg-label { color: #6d6485; font-size: 12px; margin-bottom: 16px; letter-spacing: 0.06em; text-transform: uppercase; }
        .lrb-egg-btn {
          border: 1px dashed rgba(246,243,255,0.25); background: transparent; color: #57506e;
          font-size: 12px; padding: 10px 20px; border-radius: 999px; cursor: pointer;
          transition: all .25s ease; font-family: 'Space Grotesk', sans-serif;
        }
        .lrb-egg-btn:hover { color: #ff5d73; border-color: #ff5d73; border-style: solid; box-shadow: 0 0 22px rgba(255,93,115,0.25); }

        .lrb-footer {
          position: relative; z-index: 2; padding: 26px 6vw; border-top: 1px solid rgba(246,243,255,0.08);
          display: flex; justify-content: space-between; color: #57506e; font-size: 12px; flex-wrap: wrap; gap: 8px;
        }

        .lrb-chaos {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center; flex-direction: column;
          animation: shake 0.12s infinite; padding: 20px; text-align: center;
        }
        .lrb-chaos.on-white { background: #fff; }
        .lrb-chaos.on-red { background: #d4001f; }
        .lrb-chaos.on-black { background: #000; }
        @keyframes shake {
          0% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(-4px, 3px) rotate(-0.4deg); }
          50% { transform: translate(3px, -4px) rotate(0.4deg); }
          75% { transform: translate(-3px, -3px) rotate(-0.3deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        .lrb-chaos-text {
          font-family: 'Fredoka', sans-serif; font-weight: 700;
          font-size: clamp(38px, 11vw, 130px); color: #08070c; mix-blend-mode: difference;
          letter-spacing: -0.02em;
        }
        .lrb-chaos-stop {
          margin-top: 26px; z-index: 5; padding: 13px 28px; border-radius: 999px;
          border: none; cursor: pointer; font-weight: 700; font-family: 'Space Grotesk', sans-serif;
          background: #08070c; color: #fff; font-size: 14px;
        }

        @media (max-width: 880px) {
          .lrb-navlinks { display: none; }
          .lrb-burger { display: flex; }
          .lrb-stats { grid-template-columns: repeat(2, 1fr); }
          .lrb-comments { grid-template-columns: 1fr; }
          .lrb-tl-row { grid-template-columns: 1fr; gap: 6px; }
          .lrb-hero { padding: 12vw 6vw 6vw; }
          .lrb-mood-row { gap: 12px; }
          .lrb-mood-card { width: 27vw; min-width: 96px; max-width: 130px; }
          .lrb-mood-icon svg { max-width: 42px; }
        }
        @media (max-width: 520px) {
          .lrb-nav .lrb-btn { display: none; }
          .lrb-stats { grid-template-columns: 1fr 1fr; }
          .lrb-stat { padding: 22px 12px; }
          .lrb-cta-row .lrb-btn { flex: 1 1 auto; text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="lrb-wrap">
        <div className="lrb-glow-a" />
        <div className="lrb-glow-b" />

        <nav className="lrb-nav">
          <div className="lrb-logo lrb-display">
            <span className="lrb-logo-badge">🌙</span>
            LUN<span>RAY</span>BEE
          </div>
          <div className="lrb-navlinks">
            <span>Videos (allegedly)</span>
            <span>Merch (unreleased)</span>
            <span>Lore</span>
          </div>
          <button className="lrb-btn">Subscribe, I guess</button>
          <button
            className="lrb-burger"
            aria-label="menu"
            onClick={() => setMenuOpen((m) => !m)}
          >
            <span /><span /><span />
          </button>
        </nav>
        <div className={`lrb-mobile-menu ${menuOpen ? "open" : ""}`}>
          <span>Videos (allegedly)</span>
          <span>Merch (unreleased)</span>
          <span>Lore</span>
        </div>

        <header className="lrb-hero">
          <div className="lrb-eyebrow">
            <span className="lrb-dot" /> ONLINE &middot; ARGUING WITH SOMEONE RIGHT NOW
          </div>

          <div className="lrb-mood-row">
            {MOODS.map((m) => (
              <div className="lrb-mood-card" key={m.tag} style={{ background: m.grad }}>
                <span className="lrb-mood-icon">
                  <Mascot mood={m.mood} size={54} />
                </span>
                <span className="lrb-mood-tag">{m.tag}</span>
              </div>
            ))}
          </div>

          <h1 className="lrb-title lrb-display">
            LUN<span className="hl">RAYBEE</span>
          </h1>
          <p className="lrb-sub">
            One man. Zero chill. A ring light he refuses to turn off even in
            broad daylight, at 2 PM, outdoors. This is the channel your
            recommended feed warned you about, your mother warned you about,
            and you clicked on anyway. All three of you were right to worry.
          </p>
          <div className="lrb-cta-row">
            <button className="lrb-btn">Watch the Chaos</button>
            <button className="lrb-btn ghost">I Was Warned</button>
          </div>
        </header>

        <div className="lrb-ticker">
          <div className="lrb-ticker-track">
            <span>NO SCRIPT, NO PLAN, NO REGRETS</span>
            <span>&bull;</span>
            <span>DEMONETIZED TWICE, PROUD BOTH TIMES</span>
            <span>&bull;</span>
            <span>SUBSCRIBE BUTTON JUDGING YOU RIGHT NOW</span>
            <span>&bull;</span>
            <span>CONTENT WARNING: THERE IS NO PLAN</span>
            <span>&bull;</span>
            <span>NO SCRIPT, NO PLAN, NO REGRETS</span>
            <span>&bull;</span>
            <span>DEMONETIZED TWICE, PROUD BOTH TIMES</span>
            <span>&bull;</span>
            <span>SUBSCRIBE BUTTON JUDGING YOU RIGHT NOW</span>
            <span>&bull;</span>
            <span>CONTENT WARNING: THERE IS NO PLAN</span>
          </div>
        </div>

        <div className="lrb-stats">
          {STATS.map((s) => (
            <div className="lrb-stat" key={s.l}>
              <div className="n lrb-display">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>

        <section className="lrb-section">
          <span className="lrb-kicker">A Day In The Bit</span>
          <h2 className="lrb-heading lrb-display">The Lore, Chronologically</h2>
          <p className="lrb-section-sub">
            Nobody asked for a timeline. We made one anyway. That is,
            unfortunately, the whole brand.
          </p>
          <div className="lrb-timeline">
            {TIMELINE.map((t) => (
              <div className="lrb-tl-row" key={t.title}>
                <div className="lrb-tl-tag">{t.tag}</div>
                <div>
                  <h3 className="lrb-tl-title">{t.title}</h3>
                  <p className="lrb-tl-body">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lrb-climax">
          <span className="lrb-kicker">Act III</span>
          <h2 className="lrb-climax-word lrb-display">THE CLIMAX</h2>
          <p className="lrb-climax-sub">
            Everything above this line was foreshadowing. Everything below
            it is a mistake you're about to make on purpose. There is a
            button at the bottom of this page. It does not need to be
            clicked. It will be clicked.
          </p>
        </section>

        <section className="lrb-section" style={{ paddingTop: 0 }}>
          <span className="lrb-kicker">Reception</span>
          <h2 className="lrb-heading lrb-display">What The Comments Say</h2>
          <p className="lrb-section-sub">Verified viewers. Unverified sanity.</p>
          <div className="lrb-comments">
            {COMMENTS.map((c) => (
              <div className="lrb-comment" key={c.u}>
                <span className="u">{c.u}</span>
                {c.t}
                <div className="v">▲ {c.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="lrb-egg-section">
          <div className="lrb-egg-label">
            there is nothing else on this page. definitely don't scroll
            further or click below.
          </div>
          <button className="lrb-egg-btn" onClick={() => setChaos(true)}>
            surprise
          </button>
        </section>

        <footer className="lrb-footer">
          <span>© {new Date().getFullYear()} LUNRAYBEE — a bit, not a business</span>
          <span>this entire channel is a public service announcement</span>
        </footer>
      </div>

      {chaos && (
        <div
          className={`lrb-chaos ${
            flash ? "on-white" : Math.random() > 0.5 ? "on-red" : "on-black"
          }`}
        >
          <div className="lrb-chaos-text">
            SYSTEM
            <br />
            OVERLOAD
          </div>
          <button className="lrb-chaos-stop" onClick={endChaos}>
            ok that's enough
          </button>
        </div>
      )}
    </div>
  );
}
