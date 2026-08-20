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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #07070a; }
        button { -webkit-tap-highlight-color: transparent; }

        .lrb-wrap {
          --bg: #07070a;
          --surface: rgba(255,255,255,0.045);
          --surface-strong: rgba(255,255,255,0.07);
          --line: rgba(255,255,255,0.10);
          --text: #f7f7f2;
          --muted: #9b9ba5;
          --soft: #686873;
          --pink: #ff5c7a;
          --orange: #ff9a66;
          --violet: #8c7cff;
          --yellow: #ffd45a;
          font-family: 'Space Grotesk', sans-serif;
          background:
            radial-gradient(circle at 10% -5%, rgba(255,92,122,.13), transparent 29rem),
            radial-gradient(circle at 94% 18%, rgba(140,124,255,.12), transparent 32rem),
            #07070a;
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          isolation: isolate;
        }
        .lrb-wrap::before {
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: -1;
          background-image:
            linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 78%);
        }
        .lrb-display { font-family: 'Fredoka', sans-serif; letter-spacing: -.025em; }

        .lrb-glow-a, .lrb-glow-b {
          position: absolute; pointer-events: none; z-index: -1; border-radius: 50%;
          filter: blur(50px);
        }
        .lrb-glow-a { top: -180px; left: -180px; width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(255,92,122,.18), transparent 68%); }
        .lrb-glow-b { top: 260px; right: -190px; width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(140,124,255,.16), transparent 68%); }

        .lrb-nav {
          position: sticky; top: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px clamp(18px,5vw,76px);
          background: rgba(7,7,10,.68);
          backdrop-filter: blur(22px) saturate(150%);
          -webkit-backdrop-filter: blur(22px) saturate(150%);
          border-bottom: 1px solid rgba(255,255,255,.07);
          box-shadow: 0 12px 40px rgba(0,0,0,.18);
        }
        .lrb-logo { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 9px; letter-spacing: .02em; }
        .lrb-logo-badge {
          width: 31px; height: 31px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg,#ff5c7a,#8c7cff); font-size: 15px;
          box-shadow: 0 0 28px rgba(255,92,122,.22);
        }
        .lrb-logo span { color: var(--pink); }
        .lrb-navlinks { display: flex; gap: 30px; font-size: 13px; color: #9999a4; }
        .lrb-navlinks span { transition: color .2s ease; }
        .lrb-navlinks span:hover { color: #fff; cursor: default; }
        .lrb-btn {
          border: 1px solid rgba(255,255,255,.10); cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          border-radius: 999px; padding: 12px 20px; font-size: 13px;
          background: linear-gradient(135deg,#ff6681,#ff936c); color: #140c10;
          box-shadow: 0 8px 28px rgba(255,92,122,.16), inset 0 1px rgba(255,255,255,.32);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
          white-space: nowrap;
        }
        .lrb-btn:hover { transform: translateY(-2px); filter: brightness(1.06);
          box-shadow: 0 13px 36px rgba(255,92,122,.27), inset 0 1px rgba(255,255,255,.38); }
        .lrb-btn:active { transform: translateY(0) scale(.98); }
        .lrb-btn.ghost { background: rgba(255,255,255,.035); color: #f6f6f2;
          border-color: rgba(255,255,255,.14); box-shadow: none; }
        .lrb-burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 7px; }
        .lrb-burger span { width: 22px; height: 2px; background: #f6f3ff; border-radius: 2px; }
        .lrb-mobile-menu {
          display: none; flex-direction: column; gap: 4px; padding: 10px 6vw 16px;
          background: rgba(7,7,10,.94); backdrop-filter: blur(22px);
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .lrb-mobile-menu.open { display: flex; }
        .lrb-mobile-menu span { padding: 11px 4px; font-size: 14px; color: #c7c7cf; border-bottom: 1px solid rgba(255,255,255,.055); }

        .lrb-hero { position: relative; padding: clamp(60px,8vw,120px) clamp(18px,6vw,92px) 70px; z-index: 2; max-width: 1500px; margin: 0 auto; }
        .lrb-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; letter-spacing: .13em; text-transform: uppercase;
          color: #e6e6e2; border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.035); border-radius: 999px;
          padding: 8px 13px; margin-bottom: 25px; box-shadow: inset 0 1px rgba(255,255,255,.05);
        }
        .lrb-dot { width: 6px; height: 6px; border-radius: 50%; background: #72e6a8; box-shadow: 0 0 13px #72e6a8; animation: pulse 1.6s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.75); } }

        .lrb-mood-row { display: flex; gap: 16px; margin-bottom: 42px; flex-wrap: wrap; }
        .lrb-mood-card {
          width: 142px; aspect-ratio: 3/4; border-radius: 22px; padding: 14px;
          display: flex; flex-direction: column; justify-content: space-between;
          box-shadow: 0 24px 55px rgba(0,0,0,.42), inset 0 1px rgba(255,255,255,.25);
          border: 1px solid rgba(255,255,255,.25);
          position: relative; overflow: hidden; transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease;
        }
        .lrb-mood-card::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.18), transparent 42%, rgba(0,0,0,.16));
          pointer-events: none;
        }
        .lrb-mood-card:nth-child(1) { transform: rotate(-5deg); }
        .lrb-mood-card:nth-child(2) { transform: rotate(3deg) translateY(-12px); }
        .lrb-mood-card:nth-child(3) { transform: rotate(-2deg); }
        .lrb-mood-card:hover { transform: rotate(0deg) translateY(-9px) scale(1.045); box-shadow: 0 30px 65px rgba(0,0,0,.52); }
        .lrb-mood-icon { display: block; filter: drop-shadow(0 9px 12px rgba(0,0,0,.32)); position: relative; z-index: 1; }
        .lrb-mood-icon svg { width: 100%; height: auto; max-width: 64px; }
        .lrb-mood-tag {
          font-size: 11px; font-weight: 700; background: rgba(10,8,14,.52);
          border: 1px solid rgba(255,255,255,.15); border-radius: 9px; padding: 7px 9px;
          align-self: flex-start; backdrop-filter: blur(7px); position: relative; z-index: 1;
        }

        .lrb-title {
          font-size: clamp(58px, 9.7vw, 145px); line-height: .87; margin: 0;
          font-weight: 700; max-width: 1050px;
        }
        .lrb-title .hl {
          background: linear-gradient(105deg, #ff6681 5%, #ffb06d 35%, #ffe06a 58%, #9c8cff 90%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 220% auto; animation: sheen 7s ease-in-out infinite alternate;
        }
        @keyframes sheen { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }

        .lrb-sub { font-size: clamp(15px, 1.25vw, 18px); color: #a8a8b1; max-width: 58ch; margin: 26px 0 32px; line-height: 1.7; }
        .lrb-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }

        .lrb-ticker {
          position: relative; z-index: 2; border-top: 1px solid rgba(255,255,255,.07);
          border-bottom: 1px solid rgba(255,255,255,.07); padding: 14px 0; overflow: hidden;
          background: rgba(255,255,255,.018); margin-top: 0;
        }
        .lrb-ticker-track {
          display: flex; gap: 50px; width: max-content; white-space: nowrap;
          animation: scroll 25s linear infinite; font-size: 11px; letter-spacing: .1em;
          text-transform: uppercase; color: #777781;
        }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .lrb-stats {
          position: relative; z-index: 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
          background: rgba(255,255,255,.09); margin: 44px clamp(18px,6vw,92px) 0;
          border: 1px solid rgba(255,255,255,.09); border-radius: 22px; overflow: hidden;
          box-shadow: 0 20px 70px rgba(0,0,0,.24);
        }
        .lrb-stat { background: rgba(255,255,255,.035); padding: 32px 16px; text-align: center; }
        .lrb-stat .n { font-size: clamp(25px, 3.2vw, 42px); font-family: 'Fredoka', sans-serif; font-weight: 700;
          background: linear-gradient(135deg,#fff,#b9b9c2); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .lrb-stat .l { font-size: 10.5px; color: #70707b; text-transform: uppercase; letter-spacing: .08em; margin-top: 7px; }

        .lrb-section { position: relative; z-index: 2; padding: clamp(72px,9vw,140px) clamp(18px,6vw,92px); max-width: 1500px; margin: 0 auto; }
        .lrb-heading { font-size: clamp(31px, 4vw, 54px); margin: 0 0 11px; font-weight: 700; }
        .lrb-kicker { color: #ff7890; font-size: 11px; text-transform: uppercase; letter-spacing: .17em; margin-bottom: 13px; display: block; font-weight: 700; }
        .lrb-section-sub { color: #777781; max-width: 60ch; margin-bottom: 46px; font-size: 14px; line-height: 1.65; }

        .lrb-timeline { display: flex; flex-direction: column; }
        .lrb-tl-row {
          display: grid; grid-template-columns: 100px 1fr; gap: 26px;
          padding: 29px 18px; margin: 0 -18px; border-top: 1px solid rgba(255,255,255,.075);
          transition: background .25s ease, padding-left .25s ease;
          border-radius: 12px;
        }
        .lrb-tl-row:hover { background: rgba(255,255,255,.025); padding-left: 25px; }
        .lrb-tl-row:last-child { border-bottom: 1px solid rgba(255,255,255,.075); }
        .lrb-tl-tag { font-size: 11px; font-weight: 700; color: #ffd45a; padding-top: 5px; letter-spacing: .04em; }
        .lrb-tl-title { font-size: 19px; margin: 0 0 8px; font-weight: 700; }
        .lrb-tl-body { color: #878791; font-size: 14px; line-height: 1.7; max-width: 60ch; margin: 0; }

        .lrb-climax {
          text-align: center; padding: clamp(100px,12vw,190px) 18px;
          position: relative; z-index: 2;
          background: radial-gradient(ellipse at 50% 45%, rgba(255,92,122,.12), transparent 48%);
          border-top: 1px solid rgba(255,255,255,.045); border-bottom: 1px solid rgba(255,255,255,.045);
        }
        .lrb-climax-word {
          font-size: clamp(52px, 12vw, 160px); margin: 0; font-weight: 700;
          background: linear-gradient(180deg,#fff,#777781); -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow: 0 0 55px rgba(255,92,122,.18);
        }
        .lrb-climax-sub { color: #85858e; max-width: 50ch; margin: 22px auto 0; font-size: 15px; line-height: 1.7; }

        .lrb-comments { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .lrb-comment {
          background: linear-gradient(145deg, rgba(255,255,255,.052), rgba(255,255,255,.025));
          border: 1px solid rgba(255,255,255,.09); border-radius: 18px;
          padding: 21px; font-size: 14px; line-height: 1.6;
          box-shadow: inset 0 1px rgba(255,255,255,.045);
          transition: transform .22s ease, border-color .22s ease;
        }
        .lrb-comment:hover { transform: translateY(-3px); border-color: rgba(255,255,255,.16); }
        .lrb-comment .u { color: #ffd45a; font-size: 11.5px; margin-bottom: 9px; display: block; font-weight: 700; }
        .lrb-comment .v { color: #5f5f69; font-size: 11px; margin-top: 13px; }

        .lrb-egg-section { text-align: center; padding: 90px 18px 105px; position: relative; z-index: 2; }
        .lrb-egg-label { color: #4f4f58; font-size: 11px; margin-bottom: 16px; letter-spacing: .07em; text-transform: uppercase; }
        .lrb-egg-btn {
          border: 1px dashed rgba(255,255,255,.18); background: rgba(255,255,255,.02); color: #5d5d66;
          font-size: 11px; padding: 10px 20px; border-radius: 999px; cursor: pointer;
          transition: all .25s ease; font-family: 'Space Grotesk', sans-serif;
        }
        .lrb-egg-btn:hover { color: #ff7890; border-color: #ff7890; border-style: solid; box-shadow: 0 0 28px rgba(255,92,122,.16); }

        .lrb-footer {
          position: relative; z-index: 2; padding: 27px clamp(18px,6vw,92px);
          border-top: 1px solid rgba(255,255,255,.07);
          display: flex; justify-content: space-between; color: #4f4f58; font-size: 11px; flex-wrap: wrap; gap: 8px;
        }

        .lrb-chaos {
          position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
          flex-direction: column; animation: shake .12s infinite; padding: 20px; text-align: center;
        }
        .lrb-chaos.on-white { background: #fff; }
        .lrb-chaos.on-red { background: #d4001f; }
        .lrb-chaos.on-black { background: #000; }
        @keyframes shake { 0% { transform: translate(0,0) rotate(0); } 25% { transform: translate(-4px,3px) rotate(-.4deg); } 50% { transform: translate(3px,-4px) rotate(.4deg); } 75% { transform: translate(-3px,-3px) rotate(-.3deg); } 100% { transform: translate(0,0) rotate(0); } }
        .lrb-chaos-text { font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(38px,11vw,130px); color:#08070c; mix-blend-mode:difference; letter-spacing:-.03em; }
        .lrb-chaos-stop { margin-top:26px; z-index:5; padding:13px 28px; border-radius:999px; border:none; cursor:pointer; font-weight:700; font-family:'Space Grotesk',sans-serif; background:#08070c; color:#fff; font-size:14px; }

        @media (max-width: 880px) {
          .lrb-navlinks { display:none; }
          .lrb-burger { display:flex; }
          .lrb-stats { grid-template-columns:repeat(2,1fr); }
          .lrb-comments { grid-template-columns:1fr; }
          .lrb-tl-row { grid-template-columns:1fr; gap:6px; }
          .lrb-hero { padding-top:75px; }
          .lrb-mood-row { gap:11px; }
          .lrb-mood-card { width:27vw; min-width:94px; max-width:126px; }
          .lrb-mood-icon svg { max-width:42px; }
        }
        @media (max-width: 520px) {
          .lrb-nav { padding-left:18px; padding-right:18px; }
          .lrb-nav .lrb-btn { display:none; }
          .lrb-hero { padding-top:58px; padding-bottom:58px; }
          .lrb-title { font-size: clamp(55px, 18vw, 92px); }
          .lrb-mood-row { margin-bottom:32px; }
          .lrb-mood-card { border-radius:18px; }
          .lrb-stats { margin-left:18px; margin-right:18px; border-radius:17px; }
          .lrb-stat { padding:22px 10px; }
          .lrb-stat .l { font-size:9px; }
          .lrb-cta-row { width:100%; }
          .lrb-cta-row .lrb-btn { flex:1; min-width:0; }
          .lrb-section { padding-left:18px; padding-right:18px; }
          .lrb-tl-row { margin-left:0; margin-right:0; padding-left:0; padding-right:0; }
          .lrb-tl-row:hover { padding-left:0; }
          .lrb-comments { gap:11px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; }
        }
      `}</style>

      <div className="lrb-wrap">
        <div
          aria-hidden="true"
          style={{
            position: "fixed", top: 0, left: 0, zIndex: 90, height: 2,
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg,#ff5c7a,#ffb06d,#8c7cff)",
            boxShadow: "0 0 14px rgba(255,92,122,.55)",
            transition: "width .08s linear",
            pointerEvents: "none"
          }}
        />
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
          <button className="lrb-btn" onClick={() => document.querySelector(".lrb-egg-section")?.scrollIntoView({ behavior: "smooth" })}>Subscribe, I guess</button>
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
            <button className="lrb-btn" onClick={() => setChaos(true)}>Watch the Chaos</button>
            <button className="lrb-btn ghost" onClick={() => document.querySelector(".lrb-section")?.scrollIntoView({ behavior: "smooth" })}>I Was Warned</button>
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