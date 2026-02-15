import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const steps = [
  {
    key: "s1",
    title: "Hoy no es un día cualquiera… 💘",
    text: (n) => `Hay personas que llegan sin hacer ruido, pero cambian el mood del día completo.

${n ? n + "…" : "Y tú…"} tú tienes ese algo que se queda en la cabeza (en el buen sentido).`,
    hint: "Paso 1: Dale a “Continuar” para seguir la historia.",
    mode: "next",
    nextLabel: "Continuar ➜",
  },
  {
    key: "s2",
    title: "Pequeña confesión 🙈",
    text: (n) => `Si el destino me dio la oportunidad de conocerte, yo no la quiero desperdiciar.

${n ? n + "," : ""} tú tienes una vibra bonita… de esas que se notan incluso en días pesados.`,
    hint: "Paso 2: Dale a “Descubrir algo” 😄",
    mode: "next",
    nextLabel: "Descubrir algo ✨",
  },
  {
    key: "s3",
    title: "Pregunta importante… 💌",
    text: (n) => `No vengo a complicarte la vida.
Solo a hacer el día un poquito más bonito.

${n ? n : "¿"}… ¿aceptas ser mi San Valentín?`,
    hint: "Paso 3: Elige con sinceridad 😏",
    mode: "choice",
  },
];

function getNameFromUrl() {
  if (typeof window === "undefined") return "";
  const n = new URLSearchParams(window.location.search).get("n");
  return (n || "").trim().slice(0, 24);
}

export default function ValentineCard() {
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  const buttonsAreaRef = useRef(null);
  const noBtnRef = useRef(null);
  const heartsRef = useRef(null);
  const audioRef = useRef(null);

  const s = useMemo(() => steps[step], [step]);
  const displayName = name.trim();

  useEffect(() => {
    const fromUrl = getNameFromUrl();
    if (fromUrl) setName(fromUrl);
  }, []);

  // Mostrar banner SIEMPRE al recargar (1s después).
  // Si ya está sonando la música, no lo mostramos.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!musicOn) setShowAudioPrompt(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [musicOn]);

  // Hearts (fondo)
  useEffect(() => {
    const root = heartsRef.current;
    if (!root) return;

    root.innerHTML = "";
    const count = 26;

    for (let i = 0; i < count; i++) {
      const h = document.createElement("div");
      h.className = "heart";
      h.style.left = `${Math.random() * 100}vw`;
      h.style.animationDuration = `${7 + Math.random() * 10}s`;
      h.style.animationDelay = `${Math.random() * 6}s`;
      const size = 8 + Math.random() * 18;
      h.style.width = `${size}px`;
      h.style.height = `${size}px`;
      h.style.opacity = `${0.35 + Math.random() * 0.45}`;
      root.appendChild(h);
    }
  }, []);

  // Música
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio("/music.mp3");
      a.loop = true;
      a.volume = 0.15;
      audioRef.current = a;
    }

    const a = audioRef.current;

    if (musicOn) {
      a.play().catch(() => setMusicOn(false));
    } else {
      a.pause();
      a.currentTime = 0;
    }

    return () => {
      a.pause();
    };
  }, [musicOn]);

  const evade = () => {
    const area = buttonsAreaRef.current;
    const btn = noBtnRef.current;
    if (!area || !btn) return;

    const rect = area.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const maxX = Math.max(0, rect.width - b.width - 10);
    const maxY = Math.max(0, rect.height - b.height - 10);

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    btn.style.position = "absolute";
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.transform = `rotate(${(Math.random() * 10 - 5).toFixed(2)}deg)`;
    btn.style.boxShadow = "0 14px 30px rgba(0,0,0,.12)";
  };

  const burstConfetti = () => {
    const root = document.getElementById("confetti");
    if (!root) return;

    root.innerHTML = "";
    const emojis = ["🌸", "🌷", "💖", "✨", "🌹"];
    const pieces = 90;

    for (let i = 0; i < pieces; i++) {
      const p = document.createElement("i");
      const isEmoji = Math.random() < 0.35;

      if (isEmoji) {
        p.className = "c-emoji";
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      } else {
        p.className = "c-strip";
      }

      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 0.25}s`;
      p.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
      p.style.top = `${-40 - Math.random() * 60}px`;

      root.appendChild(p);
    }
  };

  useEffect(() => {
    if (showModal) burstConfetti();
  }, [showModal]);

  const goNext = () => setStep((v) => Math.min(v + 1, 2));

  const shareLink = () => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = displayName ? `${base}?n=${encodeURIComponent(displayName)}` : base;

    if (navigator.share) {
      navigator
        .share({ title: "San Valentín 💘", text: "Te hice una página 😳💖", url })
        .catch(() => {});
      return;
    }

    navigator.clipboard?.writeText(url).catch(() => {});
    alert("Link copiado ✅\n\n" + url);
  };

  const waShare = () => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = displayName ? `${base}?n=${encodeURIComponent(displayName)}` : base;
    const msg = `Te hice una página 😳💖\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const goLetter = () => {
    // Guardar estado/tiempo para reanudar en /carta
    try {
      const a = audioRef.current;
      if (a && !a.paused) {
        sessionStorage.setItem("musicWasOn", "1");
        sessionStorage.setItem("musicTime", String(a.currentTime || 0));
      } else {
        sessionStorage.setItem("musicWasOn", "0");
        sessionStorage.setItem("musicTime", "0");
      }
    } catch {}

    const base = `${window.location.origin}/carta`;
    const url = displayName ? `${base}?n=${encodeURIComponent(displayName)}` : base;
    window.location.href = url;
  };

  const enableAudio = async () => {
    setMusicOn(true);
    setShowAudioPrompt(false);

    const a = audioRef.current;
    if (!a) return;

    try {
      await a.play();
    } catch {}
  };

  const dismissAudioPrompt = () => {
    setShowAudioPrompt(false);
  };

  return (
    <>
      {/* Fondo */}
      <div
        ref={heartsRef}
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      />

      {/* Banner audio (animado) */}
      <AnimatePresence>
        {showAudioPrompt && (
          <motion.div
            className="fixed top-3 left-0 right-0 z-[60] px-3"
            initial={{ opacity: 0, y: -14, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mx-auto max-w-2xl rounded-2xl border border-pink-200/60 bg-white/85 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,.14)] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm sm:text-base">
                <div className="font-extrabold">Activa el audio 🔊</div>
                <div className="opacity-80">
                  Se siente más lindo con musiquita (puedes apagarla cuando quieras).
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={enableAudio}
                  className="rounded-2xl px-4 py-2 font-extrabold text-white shadow-[0_10px_25px_rgba(255,77,141,.28)] bg-gradient-to-br from-pink-500 to-pink-400 active:scale-[.98]"
                >
                  Activar
                </button>

                <button
                  type="button"
                  onClick={dismissAudioPrompt}
                  className="rounded-2xl border border-pink-200/70 bg-white/70 px-4 py-2 font-extrabold text-[#7a1036] active:scale-[.98]"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch">
          {/* Left card */}
          <section className="order-1 md:order-none relative overflow-hidden rounded-3xl border border-pink-200/40 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,.12)] p-4 sm:p-6 min-h-[520px] md:min-h-[560px] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/50 bg-white/60 px-3 py-2 text-sm font-extrabold">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-pink-500 to-pink-400 shadow-[0_0_0_6px_rgba(255,77,141,.15)]" />
                Especial de San Valentín
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl border border-pink-200/50 bg-white/70 px-3 py-2 font-extrabold active:scale-[.98]"
                  onClick={() => {
                    setMusicOn((v) => !v);
                    setShowAudioPrompt(false);
                  }}
                  type="button"
                  title="Música"
                >
                  {musicOn ? "🔊" : "🔇"}
                </button>

                <button
                  className="rounded-xl border border-pink-200/50 bg-white/70 px-3 py-2 font-extrabold active:scale-[.98]"
                  onClick={shareLink}
                  type="button"
                  title="Compartir / Copiar link"
                >
                  🔗
                </button>

                <button
                  className="rounded-xl border border-pink-200/50 bg-white/70 px-3 py-2 font-extrabold active:scale-[.98]"
                  onClick={waShare}
                  type="button"
                  title="WhatsApp"
                >
                  💬
                </button>

                <button
                  className="rounded-xl border border-pink-200/50 bg-white/70 px-3 py-2 font-extrabold active:scale-[.98]"
                  onClick={goLetter}
                  type="button"
                  title="Carta"
                >
                  💌
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={s.key + "-" + displayName}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {s.title}
                </h1>
                <p className="mt-1 text-[15.5px] sm:text-[18px] leading-relaxed opacity-90 whitespace-pre-line">
                  {s.text(displayName)}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-1 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
              <input
                className="w-full rounded-2xl border border-pink-200/60 bg-white/70 px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-pink-200/40"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pon su nombre aquí (ej: Luz)"
                maxLength={24}
              />
              <button
                className="rounded-2xl border border-pink-200/60 bg-white/70 px-4 py-3 font-extrabold active:scale-[.98]"
                type="button"
                onClick={() => setName((x) => x.trim())}
              >
                Aplicar ✨
              </button>
            </div>

            <div className="mt-auto pt-3 border-t border-dashed border-pink-200/70">
              <p className="text-sm sm:text-base font-bold opacity-90">{s.hint}</p>

              <div
                ref={buttonsAreaRef}
                className="relative mt-3 min-h-[74px] flex flex-col sm:flex-row gap-3"
              >
                {s.mode === "next" && (
                  <motion.button
                    className="w-full sm:w-auto rounded-2xl px-5 py-3 font-extrabold text-white shadow-[0_10px_25px_rgba(255,77,141,.28)] bg-gradient-to-br from-pink-500 to-pink-400"
                    type="button"
                    onClick={goNext}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -1 }}
                  >
                    {s.nextLabel}
                  </motion.button>
                )}

                {s.mode === "choice" && (
                  <>
                    <motion.button
                      className="w-full sm:w-auto rounded-2xl px-5 py-3 font-extrabold text-white shadow-[0_10px_25px_rgba(255,77,141,.28)] bg-gradient-to-br from-pink-500 to-pink-400"
                      type="button"
                      onClick={() => setShowModal(true)}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -1 }}
                    >
                      Sí 💖
                    </motion.button>

                    <motion.button
                      ref={noBtnRef}
                      className="w-full sm:w-auto rounded-2xl px-5 py-3 font-extrabold border border-pink-200/70 bg-white/70 text-[#7a1036]"
                      type="button"
                      onMouseEnter={evade}
                      onClick={evade}
                      whileTap={{ scale: 0.97 }}
                    >
                      No 🙃
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Right card */}
          <aside className="order-2 md:order-none relative overflow-hidden rounded-3xl border border-pink-200/40 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,.12)] p-4 sm:p-6 flex flex-col justify-center min-h-[220px] md:min-h-[560px]">
            <div className="flex items-center justify-center">
              <motion.svg
                viewBox="0 0 512 512"
                className="w-[240px] sm:w-[300px] md:w-[360px]"
                initial={{ scale: 0.98 }}
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff4d8d" />
                    <stop offset="100%" stopColor="#ff77a8" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#heartGrad)"
                  d="M256 472s-40.6-30.5-82.2-66.4C121.7 365.4 64 308.6 64 240
                     c0-57.4 46.6-104 104-104 33.9 0 63.9 16.2 83.2 41.3
                     C270.1 152.2 300.1 136 334 136c57.4 0 104 46.6 104 104
                     0 68.6-57.7 125.4-109.8 165.6C296.6 441.5 256 472 256 472z"
                />
              </motion.svg>
            </div>

            <div className="mt-4 rounded-2xl border border-pink-200/40 bg-white/70 p-4 text-sm leading-relaxed shadow-[0_14px_40px_rgba(0,0,0,.08)]">
              No es solo una página… es una pequeña intención contigo.
            </div>
          </aside>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 ${
          showModal ? "grid" : "hidden"
        } place-items-end sm:place-items-center bg-black/35 backdrop-blur-md p-3`}
        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
      >
        <motion.div
          className="relative w-full sm:w-[760px] rounded-3xl border border-pink-200/50 bg-white/90 shadow-[0_25px_90px_rgba(0,0,0,.2)] overflow-hidden"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            id="confetti"
            className="confetti absolute inset-0 pointer-events-none"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="text-xl sm:text-3xl font-extrabold">¡Dijo que sí! 🎉</h2>
            <button
              className="rounded-2xl border border-pink-200/60 bg-pink-50/60 px-4 py-2 font-extrabold text-[#7a1036]"
              onClick={() => setShowModal(false)}
              type="button"
            >
              Cerrar
            </button>
          </div>

          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-[15.5px] sm:text-[17px]">
              Ok, ya está oficial: <b>{displayName || "tú"}</b> eres mi San Valentín 💖
            </p>

            <div className="mt-3 rounded-2xl border border-pink-200/50 bg-gradient-to-br from-pink-100/60 to-pink-50/60 p-4 leading-relaxed">
              Gracias por decir que sí 💖
              <br /><br />
              No prometo perfección,
              <br />
              pero sí intención,
              <br />
              atención…
              <br />
              y un momento que recuerdes.
              <br /><br />
              Ahora dime, ¿cuándo te invito ese café? 😉
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                className="rounded-2xl px-5 py-3 font-extrabold text-white shadow-[0_10px_25px_rgba(255,77,141,.28)] bg-gradient-to-br from-pink-500 to-pink-400"
                type="button"
                onClick={waShare}
              >
                Enviar por WhatsApp 💬
              </button>
              <button
                className="rounded-2xl border border-pink-200/70 bg-white/70 px-5 py-3 font-extrabold text-[#7a1036]"
                type="button"
                onClick={shareLink}
              >
                Copiar link 🔗
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
