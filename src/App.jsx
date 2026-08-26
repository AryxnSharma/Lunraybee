import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * LUNRAYBEE — a fictional, tongue-in-cheek "creator" landing page.
 * Not modeled on any real person. Visual system inspired by the
 * black / green, bold-type, rounded-card language of music streaming
 * apps — big cover art, track-list rows, pill buttons.
 *
 * Drop images named 1.png .. 15.png into your /public folder and the
 * strip under the hero title will pick them up automatically.
 */

const SLIDE_IMAGES = Array.from({ length: 15 }, (_, i) => `/${i + 1}.png`);

// Alternating vertical offset + tilt so the strip reads as an overlapping
// cascade of cards rather than a flat row. Values are small and symmetric
// so the pattern still tiles cleanly when the track loops.
const OFFSET_PATTERN = [0, -18, 10, -8, 16, -14, 7, -12, 14, -6, 11, -16, 5, -10, 13];

function SlideStrip() {
  const [broken, setBroken] = useState({});
  const loop = [...SLIDE_IMAGES, ...SLIDE_IMAGES];

  return (
    <div className="lrb-strip">
      <div className="lrb-strip-track">
        {loop.map((src, i) => {
          const n = (i % SLIDE_IMAGES.length) + 1;
          const offset = OFFSET_PATTERN[i % OFFSET_PATTERN.length];
          const tilt = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3));
          return (
            <div
              className="lrb-strip-card"
              key={`${src}-${i}`}
              style={{
                "--ty": `${offset}px`,
                "--rot": `${tilt}deg`,
                zIndex: loop.length - i,
              }}
            >
              {!broken[src] ? (
                <img
                  src={src}
                  alt={`Lunraybee still ${n}`}
                  loading="eager"
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
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src="/dodge.png"
        alt=""
        width={size}
        height={size}
        className="lrb-logo-image"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#1DB954" />
      <path d="M9 20c4-2.4 10-2.4 14 0" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M8 15.5c5-2.8 11-2.8 16 0" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M7 11c6-3 12-3 18 0" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}


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
  const stopSiren = useSiren(chaos);
  const autoStopRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.title = "Lunraybee";

    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = "/favicon.png";
    icon.type = "image/png";

    return () => {
      // Keep the browser tab stable when the component unmounts.
    };
  }, []);

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
        .lrb-logo-image { width: 30px; height: 30px; object-fit: contain; display: block; border-radius: 50%; }
        .lrb-thank-you {
          color: var(--green-bright);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .16em;
          margin: 0 auto 14px;
          text-align: center;
        }
        .lrb-thankyou-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          margin-top: 8px;
        }
        .lrb-thankyou-block .lrb-sub {
          margin: 0 0 22px;
          max-width: 60ch;
        }
        .lrb-thankyou-block .lrb-cta-row {
          justify-content: center;
        }
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

        .lrb-hero { position: relative; padding: clamp(40px,7vw,96px) clamp(16px,6vw,64px) 70px; z-index: 2; max-width: 1500px; margin: 0 auto; }
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
  font-size: clamp(46px, 9vw, 132px);
  line-height: .92;
  margin: 0 auto;
  font-weight: 900;
  max-width: 1100px;
  width: 100%;
  text-align: center;
}
        .lrb-title .hl { color: var(--green-bright); }

        /* ---- image slide strip: bigger cards, smooth overlapping cascade ---- */
        .lrb-strip {
          margin: clamp(40px, 6vw, 64px) 0 clamp(24px, 3vw, 32px);
          padding: 34px 0 22px;
          overflow: hidden;
          position: relative;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
        }
        .lrb-strip-track {
          display: flex;
          align-items: center;
          gap: 0;
          width: max-content;
          animation: lrb-slide 48s linear infinite;
          will-change: transform;
          transform: translate3d(0,0,0);
          backface-visibility: hidden;
        }
        .lrb-strip:hover .lrb-strip-track { animation-play-state: paused; }
        @keyframes lrb-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .lrb-strip-card {
          position: relative;
          flex: 0 0 auto;
          width: clamp(300px, 30vw, 430px);
          height: clamp(300px, 30vw, 430px);
          margin-left: clamp(-72px, -5vw, -42px);
          border-radius: 14px;
          overflow: hidden;
          background: var(--card);
          box-shadow: 0 18px 40px rgba(0,0,0,.55), 0 2px 0 rgba(255,255,255,.03) inset;\n          will-change: transform;\n          backface-visibility: hidden;
          border: 1px solid rgba(255,255,255,.06);
          transform: translateY(var(--ty, 0px)) rotate(var(--rot, 0deg));
          transition: transform .55s cubic-bezier(.16,1,.3,1), box-shadow .4s ease, filter .4s ease;\n          contain: layout paint;
        }
        .lrb-strip-card:first-child { margin-left: 0; }
        .lrb-strip-card:hover {
          transform: translateY(calc(var(--ty, 0px) - 22px)) rotate(0deg) scale(1.1);
          box-shadow: 0 30px 60px rgba(0,0,0,.65);
          z-index: 999 !important;
        }
        .lrb-strip-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lrb-strip-fallback {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(155deg,#1DB954,#0a4a26); color: rgba(0,0,0,.6);
          font-weight: 800; font-size: 13px; letter-spacing: .04em;
        }
        .lrb-strip-play {
          position: absolute; right: 10px; bottom: 10px; width: 40px; height: 40px; border-radius: 50%;
          background: var(--green); display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateY(6px) scale(.85);
          transition: opacity .3s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1);
          box-shadow: 0 6px 14px rgba(0,0,0,.4);
        }
        .lrb-strip-card:hover .lrb-strip-play { opacity: 1; transform: translateY(0) scale(1); }

        .lrb-sub { font-size: clamp(14.5px, 1.2vw, 17px); color: var(--muted); max-width: 58ch; margin: 30px 0 30px; line-height: 1.7; font-weight: 500; }
        .lrb-cta-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .lrb-cta-row .lrb-btn.big { padding: 15px 30px; font-size: 14.5px; }

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
        
        

        .lrb-footer {
          position: relative; z-index: 2; padding: 24px clamp(16px,6vw,64px);
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

        /* ---------------- responsive ---------------- */
        @media (max-width: 880px) {
          .lrb-comments { grid-template-columns:1fr; }
          .lrb-hero { padding-top:52px; }
          .lrb-strip-card {
            width: clamp(250px, 42vw, 340px);
            height: clamp(250px, 42vw, 340px);
            margin-left: clamp(-58px, -7vw, -32px);
            border-radius: 12px;
          }
          .lrb-strip { padding: 26px 0 18px; }
          .lrb-strip-track { animation-duration: 38s; }
        }
        @media (max-width: 520px) {
          .lrb-nav { padding-left:16px; padding-right:16px; }
          .lrb-nav .lrb-btn { display:none; }
          .lrb-hero { padding-top:44px; padding-bottom:38px; padding-left:16px; padding-right:16px; }
          .lrb-thank-you { margin-bottom: 12px; font-size: 11px; }
          .lrb-title { font-size: clamp(40px, 15vw, 76px); }
          .lrb-sub { margin-top: 22px; }
          .lrb-strip {
            margin: 30px -16px 20px;
            padding: 20px 0 16px;
          }
          .lrb-strip-card {
            width: clamp(190px, 62vw, 270px);
            height: clamp(190px, 62vw, 270px);
            margin-left: clamp(-42px, -9vw, -24px);
            border-radius: 10px;
            box-shadow: 0 10px 24px rgba(0,0,0,.5);
          }
          .lrb-strip-card:hover {
            transform: translateY(calc(var(--ty, 0px) - 10px)) rotate(0deg) scale(1.05);
          }
          .lrb-strip-play { width: 32px; height: 32px; right: 7px; bottom: 7px; }
          .lrb-strip-track { animation-duration: 30s; gap: 0; }
          .lrb-cta-row { width:100%; }
          .lrb-cta-row .lrb-btn { flex:1; min-width:0; }
          .lrb-comments { gap:11px; }
        }
        @media (max-width: 380px) {
          .lrb-strip-card {
            width: clamp(170px, 70vw, 230px);
            height: clamp(170px, 70vw, 230px);
            margin-left: clamp(-34px, -10vw, -20px);
          }
        }
        @media (hover: none) {
          /* touch devices: no hover pause/scale, so give the pause button-free
             animation a touch of breathing room instead */
          .lrb-strip-card:active {
            transform: translateY(calc(var(--ty, 0px) - 10px)) rotate(0deg) scale(1.06);
            z-index: 999;
          }
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
          <button className="lrb-btn" onClick={() => document.querySelector(".lrb-egg-section")?.scrollIntoView({ behavior: "smooth" })}>UNC ALERT</button>
        </nav>

        <header className="lrb-hero">
          <div className="lrb-thank-you">TERI MUMMY MERI HOJA </div>
          <div className="lrb-eyebrow">
            <span className="badge">269 years old</span> OLDEST PERSON ALIVE ON EARTH
          </div>

          <h1 className="lrb-title lrb-display">
            Lun<span className="hl">raybee</span>
          </h1>

          <SlideStrip />

          <div className="lrb-thankyou-block">
            <p className="lrb-sub">
              Thank you SUNRAYBEE for making us laugh, much love.
            </p>
            <div className="lrb-cta-row">
              <button className="lrb-btn big" onClick={() => setChaos(true)}>▶ Special Surprise for unc</button>
            </div>
          </div>

        </header>



        <section className="lrb-egg-section">
          <div className="lrb-egg-label">
            website under progress, will complete it soon.
          </div>
        
        </section>

        <footer className="lrb-footer">
          <span>© {new Date().getFullYear()} Lunraybee </span>
          <span>design copied by SPOTIFY, for copyright - file a legal notice to SUNRAYBEE </span>
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
            sorry unc
          </button>
        </div>
      )}
    </div>
  );
}