import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * LUNRAYBEE — a fictional, tongue-in-cheek "creator" landing page.
 * Not modeled on any real person. Visual system inspired by the
 * black / green, bold-type, rounded-card language of music streaming
 * apps — big cover art, track-list rows, pill buttons.
 *
 * Drop images named 1.png .. 8.png into your /public folder and the
 * strip under the hero title will pick them up automatically.
 */

const SLIDE_IMAGES = Array.from({ length: 8 }, (_, i) => `/${i + 1}.png`);

function SlideStrip() {
  const [broken, setBroken] = useState({});
  const loop = [...SLIDE_IMAGES, ...SLIDE_IMAGES];

  return (
    <div className="lrb-strip">
      <div className="lrb-strip-track">
        {loop.map((src, i) => {
          const n = (i % SLIDE_IMAGES.length) + 1;
          return (
            <div className="lrb-strip-card" key={`${src}-${i}`}>
              {!broken[src] ? (
                <img
                  src={src}
                  alt={`Lunraybee still ${n}`}
                  loading="lazy"
                  draggable="false"
                  onError={() => setBroken((b) => ({ ...b, [src]: true }))}
                />
              ) : (
                <div className="lrb-strip-fallback">
                  <span>{n}.png</span>
                </div>
              )}
              <div className="lrb-strip-play" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Small abstract waveform mark for the nav — not a reproduction of any
// existing brand logo, just three arcs in a circle.
function Mark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#1DB954" />
      <path d="M9 20c4-2.4 10-2.4 14 0" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M8 15.5c5-2.8 11-2.8 16 0" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M7 11c6-3 12-3 18 0" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const MOODS = [
  { tag: "unbothered", label: "Composed", art: "linear-gradient(155deg,#1DB954,#0a4a26)" },
  { tag: "feral", label: "Unhinged", art: "linear-gradient(155deg,#8c1eff,#2a0a4a)" },
  { tag: "buffering", label: "Dissolving", art: "linear-gradient(155deg,#ff9d1e,#7a3d00)" },
];

const STATS = [
  { n: "2.3M", l: "Views Farmed" },
  { n: "0", l: "Apologies Issued" },
  { n: "14", l: "Ring Lights Destroyed" },
  { n: "1", l: "Personality (shared across all videos)" },
];

const TIMELINE = [
  {
    tag: "6:00",
    title: "Wakes up already correct",
    body: "No alarm. No skincare routine. Just vibes and an unshakeable belief that the algorithm personally owes him something.",
  },
  {
    tag: "12:00",
    title: "Films 40 minutes, keeps 12 seconds",
    body: "The other 39:48 becomes 'unreleased footage' — a phrase doing the heavy lifting of an entire archive.",
  },
  {
    tag: "15:00",
    title: "Googles himself, regrets it instantly",
    body: "Finds a comment from 2022 he still hasn't recovered from. Reads it 4 more times to be sure.",
  },
  {
    tag: "18:00",
    title: "Wins an argument with a stranger",
    body: "Screenshots it. Frames it. It now outranks his diploma on the living room wall.",
  },
  {
    tag: "00:00",
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
  const [flash, setFlash] = useState(null);
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
      const flashClasses = ["on-white", "on-red", "on-black", "on-green"];
      const tick = () => {
        setFlash(flashClasses[Math.floor(Math.random() * flashClasses.length)]);
        t = setTimeout(tick, 90 + Math.random() * 60);
      };
      tick();
      autoStopRef.current = setTimeout(() => setChaos(false), 9000);
    } else {
      setFlash(null);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #000; }
        button { -webkit-tap-highlight-color: transparent; }

        .lrb-wrap {
          --bg: #000000;
          --elevated: #121212;
          --elevated-hi: #1a1a1a;
          --card: #181818;
          --card-hover: #282828;
          --line: rgba(255,255,255,0.08);
          --text: #ffffff;
          --muted: #b3b3b3;
          --soft: #727272;
          --green: #1DB954;
          --green-bright: #1ED760;
          --purple: #8c1eff;
          --orange: #ff9d1e;
          font-family: 'Inter', sans-serif;
          background:
            radial-gradient(1200px 620px at 50% -10%, rgba(29,185,84,.20), transparent 60%),
            #000000;
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          isolation: isolate;
        }
        .lrb-display { font-family: 'Inter', sans-serif; font-weight: 900; letter-spacing: -.03em; }

        .lrb-nav {
          position: sticky; top: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px clamp(18px,5vw,64px);
          background: rgba(0,0,0,.75);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--line);
        }
        .lrb-logo { font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 10px; letter-spacing: -.01em; }
        .lrb-navlinks { display: flex; gap: 28px; font-size: 13.5px; color: var(--muted); font-weight: 700; }
        .lrb-navlinks span { transition: color .2s ease; cursor: default; }
        .lrb-navlinks span:hover { color: var(--text); }
        .lrb-btn {
          border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 800;
          border-radius: 500px; padding: 13px 26px; font-size: 13.5px;
          background: var(--green); color: #000;
          transition: transform .15s ease, background .15s ease;
          white-space: nowrap;
        }
        .lrb-btn:hover { transform: scale(1.045); background: var(--green-bright); }
        .lrb-btn:active { transform: scale(.98); }
        .lrb-btn.ghost { background: transparent; color: var(--text);
          border: 1px solid rgba(255,255,255,.3); padding: 12px 25px; }
        .lrb-btn.ghost:hover { border-color: #fff; transform: scale(1.045); background: transparent; }
        .lrb-burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 7px; }
        .lrb-burger span { width: 22px; height: 2px; background: #fff; border-radius: 2px; }
        .lrb-mobile-menu {
          display: none; flex-direction: column; gap: 4px; padding: 10px 6vw 16px;
          background: rgba(0,0,0,.96); backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--line);
        }
        .lrb-mobile-menu.open { display: flex; }
        .lrb-mobile-menu span { padding: 11px 4px; font-size: 14px; font-weight: 700; color: var(--muted); border-bottom: 1px solid rgba(255,255,255,.06); }

        .lrb-hero { position: relative; padding: clamp(48px,7vw,96px) clamp(18px,6vw,64px) 40px; z-index: 2; max-width: 1500px; margin: 0 auto; }
        .lrb-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
          color: var(--text); background: rgba(255,255,255,.08);
          border-radius: 999px; padding: 6px 14px 6px 8px; margin-bottom: 22px;
        }
        .lrb-eyebrow .badge { background: var(--green); color: #000; border-radius: 999px; padding: 2px 9px; font-size: 11px; }
        .lrb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-bright); animation: pulse 1.6s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.7); } }

        .lrb-title {
          font-size: clamp(52px, 9vw, 132px); line-height: .92; margin: 0;
          font-weight: 900; max-width: 1100px;
        }
        .lrb-title .hl { color: var(--green-bright); }

        /* ---- image slide strip ---- */
        .lrb-strip { margin: 34px 0 8px; overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
        }
        .lrb-strip-track { display: flex; gap: 16px; width: max-content; animation: lrb-slide 26s linear infinite; }
        .lrb-strip:hover .lrb-strip-track { animation-play-state: paused; }
        @keyframes lrb-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .lrb-strip-card {
          position: relative; width: 168px; height: 168px; flex: 0 0 auto;
          border-radius: 8px; overflow: hidden; background: var(--card);
          box-shadow: 0 8px 24px rgba(0,0,0,.5);
          transition: transform .25s ease;
        }
        .lrb-strip-card:hover { transform: translateY(-4px); }
        .lrb-strip-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lrb-strip-fallback {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(155deg,#1DB954,#0a4a26); color: rgba(0,0,0,.6);
          font-weight: 800; font-size: 13px; letter-spacing: .04em;
        }
        .lrb-strip-play {
          position: absolute; right: 8px; bottom: 8px; width: 34px; height: 34px; border-radius: 50%;
          background: var(--green); display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateY(6px); transition: opacity .2s ease, transform .2s ease;
          box-shadow: 0 6px 14px rgba(0,0,0,.4);
        }
        .lrb-strip-card:hover .lrb-strip-play { opacity: 1; transform: translateY(0); }

        .lrb-sub { font-size: clamp(15px, 1.2vw, 17px); color: var(--muted); max-width: 58ch; margin: 30px 0 30px; line-height: 1.7; font-weight: 500; }
        .lrb-cta-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .lrb-cta-row .lrb-btn.big { padding: 15px 30px; font-size: 14.5px; }

        .lrb-mood-row { display: flex; gap: 18px; margin: 46px 0 6px; flex-wrap: wrap; }
        .lrb-mood-card {
          width: 172px; border-radius: 8px; padding: 16px; background: var(--card);
          transition: background .25s ease, transform .25s ease; position: relative;
          border: 1px solid transparent;
        }
        .lrb-mood-card:hover { background: var(--card-hover); transform: translateY(-4px); }
        .lrb-mood-art { width: 100%; aspect-ratio: 1/1; border-radius: 6px; margin-bottom: 14px; position: relative;
          box-shadow: 0 10px 26px rgba(0,0,0,.45); }
        .lrb-mood-play {
          position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%;
          background: var(--green); display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateY(8px); transition: opacity .2s ease, transform .2s ease;
          box-shadow: 0 8px 16px rgba(0,0,0,.5);
        }
        .lrb-mood-card:hover .lrb-mood-play { opacity: 1; transform: translateY(0); }
        .lrb-mood-label { font-size: 14.5px; font-weight: 800; margin-bottom: 4px; }
        .lrb-mood-tag { font-size: 12.5px; color: var(--soft); font-weight: 600; }

        .lrb-ticker {
          position: relative; z-index: 2; border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line); padding: 13px 0; overflow: hidden;
          background: rgba(255,255,255,.02); margin-top: 46px;
        }
        .lrb-ticker-track {
          display: flex; gap: 42px; width: max-content; white-space: nowrap;
          animation: scroll 24s linear infinite; font-size: 12px; font-weight: 800;
          text-transform: uppercase; letter-spacing: .06em; color: var(--soft);
        }
        .lrb-ticker-track span.dot { color: var(--green); }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .lrb-stats {
          position: relative; z-index: 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
          margin: 44px clamp(18px,6vw,64px) 0;
        }
        .lrb-stat { background: var(--card); border-radius: 8px; padding: 26px 16px; text-align: left; transition: background .2s ease; }
        .lrb-stat:hover { background: var(--card-hover); }
        .lrb-stat .n { font-size: clamp(24px, 3vw, 36px); font-weight: 900; color: var(--text); }
        .lrb-stat .l { font-size: 11px; color: var(--soft); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 8px; }

        .lrb-section { position: relative; z-index: 2; padding: clamp(64px,8vw,120px) clamp(18px,6vw,64px); max-width: 1500px; margin: 0 auto; }
        .lrb-heading { font-size: clamp(26px, 3.2vw, 40px); margin: 0 0 8px; font-weight: 900; letter-spacing: -.02em; }
        .lrb-kicker { color: var(--green-bright); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; display: block; }
        .lrb-section-sub { color: var(--soft); max-width: 60ch; margin-bottom: 34px; font-size: 14px; line-height: 1.6; font-weight: 500; }

        .lrb-timeline { display: flex; flex-direction: column; }
        .lrb-tl-row {
          display: grid; grid-template-columns: 34px 1fr 60px; align-items: center; gap: 20px;
          padding: 14px 12px; border-radius: 6px; transition: background .15s ease;
        }
        .lrb-tl-row:hover { background: rgba(255,255,255,.06); }
        .lrb-tl-num { color: var(--soft); font-weight: 700; font-size: 14px; text-align: center; }
        .lrb-tl-play {
          display: none; width: 16px; height: 16px; margin: 0 auto; color: var(--text);
        }
        .lrb-tl-row:hover .lrb-tl-num { display: none; }
        .lrb-tl-row:hover .lrb-tl-play { display: block; }
        .lrb-tl-title { font-size: 15.5px; margin: 0 0 3px; font-weight: 700; }
        .lrb-tl-row:hover .lrb-tl-title { color: var(--green-bright); }
        .lrb-tl-body { color: var(--soft); font-size: 13px; line-height: 1.55; max-width: 62ch; margin: 0; font-weight: 500; }
        .lrb-tl-tag { color: var(--soft); font-size: 13px; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }

        .lrb-climax {
          text-align: center; padding: clamp(90px,11vw,170px) 18px;
          position: relative; z-index: 2;
          background: radial-gradient(ellipse at 50% 45%, rgba(29,185,84,.16), transparent 55%);
          border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
        }
        .lrb-climax-word {
          font-size: clamp(46px, 10.5vw, 140px); margin: 0; font-weight: 900; letter-spacing: -.03em;
          color: var(--text);
        }
        .lrb-climax-word .g { color: var(--green-bright); }
        .lrb-climax-sub { color: var(--soft); max-width: 50ch; margin: 22px auto 0; font-size: 14.5px; line-height: 1.7; font-weight: 500; }

        .lrb-comments { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .lrb-comment {
          background: var(--card);
          border-radius: 8px;
          padding: 20px; font-size: 14px; line-height: 1.6; font-weight: 500;
          transition: background .2s ease, transform .2s ease;
        }
        .lrb-comment:hover { background: var(--card-hover); transform: translateY(-3px); }
        .lrb-comment .u { color: var(--green-bright); font-size: 12.5px; margin-bottom: 9px; display: block; font-weight: 800; }
        .lrb-comment .v { color: var(--soft); font-size: 11.5px; margin-top: 13px; font-weight: 700; }

        .lrb-egg-section { text-align: center; padding: 80px 18px 100px; position: relative; z-index: 2; }
        .lrb-egg-label { color: var(--soft); font-size: 12px; margin-bottom: 16px; font-weight: 600; }
        .lrb-egg-btn {
          border: 1px solid rgba(255,255,255,.25); background: transparent; color: var(--muted);
          font-size: 12px; font-weight: 800; padding: 11px 24px; border-radius: 999px; cursor: pointer;
          transition: all .2s ease; text-transform: uppercase; letter-spacing: .05em;
        }
        .lrb-egg-btn:hover { color: #000; border-color: var(--green); background: var(--green); }

        .lrb-footer {
          position: relative; z-index: 2; padding: 24px clamp(18px,6vw,64px);
          border-top: 1px solid var(--line);
          display: flex; justify-content: space-between; color: var(--soft); font-size: 11.5px; flex-wrap: wrap; gap: 8px;
          font-weight: 600;
        }

        .lrb-chaos {
          position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
          flex-direction: column; animation: shake .12s infinite; padding: 20px; text-align: center;
        }
        .lrb-chaos.on-white { background: #fff; }
        .lrb-chaos.on-red { background: #d4001f; }
        .lrb-chaos.on-black { background: #000; }
        .lrb-chaos.on-green { background: #1DB954; }
        @keyframes shake { 0% { transform: translate(0,0) rotate(0); } 25% { transform: translate(-4px,3px) rotate(-.4deg); } 50% { transform: translate(3px,-4px) rotate(.4deg); } 75% { transform: translate(-3px,-3px) rotate(-.3deg); } 100% { transform: translate(0,0) rotate(0); } }
        .lrb-chaos-text { font-family:'Inter',sans-serif; font-weight:900; font-size:clamp(38px,11vw,130px); color:#08070c; mix-blend-mode:difference; letter-spacing:-.03em; }
        .lrb-chaos-stop { margin-top:26px; z-index:5; padding:14px 30px; border-radius:999px; border:none; cursor:pointer; font-weight:800; background:#000; color:#fff; font-size:14px; }

        @media (max-width: 880px) {
          .lrb-navlinks { display:none; }
          .lrb-burger { display:flex; }
          .lrb-stats { grid-template-columns:repeat(2,1fr); }
          .lrb-comments { grid-template-columns:1fr; }
          .lrb-hero { padding-top:60px; }
          .lrb-mood-card { width:32vw; min-width:120px; max-width:150px; }
          .lrb-strip-card { width:130px; height:130px; }
        }
        @media (max-width: 520px) {
          .lrb-nav { padding-left:18px; padding-right:18px; }
          .lrb-nav .lrb-btn { display:none; }
          .lrb-hero { padding-top:48px; padding-bottom:24px; }
          .lrb-title { font-size: clamp(46px, 16vw, 82px); }
          .lrb-strip-card { width:112px; height:112px; }
          .lrb-stats { margin-left:18px; margin-right:18px; }
          .lrb-cta-row { width:100%; }
          .lrb-cta-row .lrb-btn { flex:1; min-width:0; }
          .lrb-section { padding-left:18px; padding-right:18px; }
          .lrb-comments { gap:11px; }
          .lrb-tl-row { grid-template-columns: 22px 1fr 46px; gap:10px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; }
        }
      `}</style>

      <div className="lrb-wrap">
        <div
          aria-hidden="true"
          style={{
            position: "fixed", top: 0, left: 0, zIndex: 90, height: 3,
            width: `${scrollProgress}%`,
            background: "#1DB954",
            transition: "width .08s linear",
            pointerEvents: "none"
          }}
        />

        <nav className="lrb-nav">
          <div className="lrb-logo">
            <Mark size={30} />
            Lunraybee
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
            <span className="badge">LIVE</span> A mummy can be, Lunraybee, Bundraybee, Gandraybee
          </div>

          <h1 className="lrb-title lrb-display">
            Lun<span className="hl">raybee</span>
          </h1>

          <SlideStrip />

          <p className="lrb-sub">
            One man. Zero chill. A ring light he refuses to turn off even in
            broad daylight, at 2 PM, outdoors. This is the channel your
            recommended feed warned you about, your mother warned you about,
            and you clicked on anyway. All three of you were right to worry.
          </p>
          <div className="lrb-cta-row">
            <button className="lrb-btn big" onClick={() => setChaos(true)}>▶ Watch the Chaos</button>
            <button className="lrb-btn ghost" onClick={() => document.querySelector(".lrb-section")?.scrollIntoView({ behavior: "smooth" })}>I Was Warned</button>
          </div>

          <div className="lrb-mood-row">
            {MOODS.map((m) => (
              <div className="lrb-mood-card" key={m.tag}>
                <div className="lrb-mood-art" style={{ background: m.art }}>
                  <div className="lrb-mood-play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <div className="lrb-mood-label">{m.label}</div>
                <div className="lrb-mood-tag">{m.tag}</div>
              </div>
            ))}
          </div>
        </header>

        <div className="lrb-ticker">
          <div className="lrb-ticker-track">
            <span>NO SCRIPT, NO PLAN, NO REGRETS</span>
            <span className="dot">&bull;</span>
            <span>DEMONETIZED TWICE, PROUD BOTH TIMES</span>
            <span className="dot">&bull;</span>
            <span>SUBSCRIBE BUTTON JUDGING YOU RIGHT NOW</span>
            <span className="dot">&bull;</span>
            <span>CONTENT WARNING: THERE IS NO PLAN</span>
            <span className="dot">&bull;</span>
            <span>NO SCRIPT, NO PLAN, NO REGRETS</span>
            <span className="dot">&bull;</span>
            <span>DEMONETIZED TWICE, PROUD BOTH TIMES</span>
            <span className="dot">&bull;</span>
            <span>SUBSCRIBE BUTTON JUDGING YOU RIGHT NOW</span>
            <span className="dot">&bull;</span>
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
          <h2 className="lrb-heading">The Lore, Chronologically</h2>
          <p className="lrb-section-sub">
            Nobody asked for a timeline. We made one anyway. That is,
            unfortunately, the whole brand.
          </p>
          <div className="lrb-timeline">
            {TIMELINE.map((t, i) => (
              <div className="lrb-tl-row" key={t.title}>
                <div>
                  <span className="lrb-tl-num">{i + 1}</span>
                  <svg className="lrb-tl-play" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div>
                  <h3 className="lrb-tl-title">{t.title}</h3>
                  <p className="lrb-tl-body">{t.body}</p>
                </div>
                <div className="lrb-tl-tag">{t.tag}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="lrb-climax">
          <span className="lrb-kicker">Act III</span>
          <h2 className="lrb-climax-word lrb-display">THE <span className="g">CLIMAX</span></h2>
          <p className="lrb-climax-sub">
            Everything above this line was foreshadowing. Everything below
            it is a mistake you're about to make on purpose. There is a
            button at the bottom of this page. It does not need to be
            clicked. It will be clicked.
          </p>
        </section>

        <section className="lrb-section" style={{ paddingTop: 0 }}>
          <span className="lrb-kicker">Reception</span>
          <h2 className="lrb-heading">What The Comments Say</h2>
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
          <span>© {new Date().getFullYear()} Lunraybee — a bit, not a business</span>
          <span>this entire channel is a public service announcement</span>
        </footer>
      </div>

      {chaos && (
        <div className={`lrb-chaos ${flash || "on-black"}`}>
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