import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

function getNameFromUrl() {
  if (typeof window === "undefined") return "";
  const n = new URLSearchParams(window.location.search).get("n");
  return (n || "").trim().slice(0, 24);
}

export default function Letter() {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");

  // Música (para reanudar)
  const [musicOn, setMusicOn] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fromUrl = getNameFromUrl();
    if (fromUrl) setName(fromUrl);
  }, []);

  // Inicializa el audio y decide si mostrar el prompt
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio("/music.mp3");
      a.loop = true;
      a.volume = 0.15;
      audioRef.current = a;
    }

    // Si venía sonando desde la página principal, mostramos el prompt para reanudar
    try {
      const wasOn = sessionStorage.getItem("musicWasOn"); // "1" o "0"
      if (wasOn === "1") {
        setShowAudioPrompt(true);
      }
    } catch {}

    return () => {
      // al salir de la página, pausa
      audioRef.current?.pause();
    };
  }, []);

  // Control play/pause con state
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    if (musicOn) {
      a.play().catch(() => setMusicOn(false));
    } else {
      a.pause();
    }
  }, [musicOn]);

  const enableAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    setMusicOn(true);
    setShowAudioPrompt(false);

    // Reanudar desde el segundo guardado (si existe)
    try {
      const t = Number(sessionStorage.getItem("musicTime") || "0");
      if (!Number.isNaN(t)) a.currentTime = t;
    } catch {}

    try {
      await a.play();
    } catch {
      // si el navegador lo bloquea, no rompemos nada
    }

    // marcamos que ya está activo
    try {
      sessionStorage.setItem("musicWasOn", "1");
    } catch {}
  };

  const dismissAudioPrompt = () => {
    setShowAudioPrompt(false);
    try {
      // si no quiere reanudar aquí, no lo volvemos a molestar en esta sesión
      sessionStorage.setItem("musicWasOn", "0");
      sessionStorage.setItem("musicTime", "0");
    } catch {}
  };

  const to = useMemo(() => (name.trim() ? name.trim() : "Tú"), [name]);

  const backUrl = useMemo(() => {
    const n = name.trim();
    return n ? `/?n=${encodeURIComponent(n)}` : "/";
  }, [name]);

  return (
    <div className="w-full max-w-5xl">
      {/* Banner audio */}
      {showAudioPrompt && (
        <div className="fixed top-3 left-0 right-0 z-[60] px-3">
          <div className="mx-auto max-w-2xl rounded-2xl border border-pink-200/60 bg-white/85 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,.14)] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm sm:text-base">
              <div className="font-extrabold">¿Reanudar el audio? 🔊</div>
              <div className="opacity-80">
                La música se detuvo al cambiar de página. Si quieres, la seguimos.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={enableAudio}
                className="rounded-2xl px-4 py-2 font-extrabold text-white shadow-[0_10px_25px_rgba(255,77,141,.28)] bg-gradient-to-br from-pink-500 to-pink-400"
              >
                Reanudar
              </button>

              <button
                type="button"
                onClick={dismissAudioPrompt}
                className="rounded-2xl border border-pink-200/70 bg-white/70 px-4 py-2 font-extrabold text-[#7a1036]"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Una carta para <span className="text-pink-600">{to}</span> 💌
        </h1>
        <p className="mt-2 opacity-80 font-semibold">Toca el sobre para abrirla.</p>

        {/* Mini control de audio (por si quiere encender/apagar aquí también) */}
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setMusicOn((v) => !v)}
            className="rounded-2xl border border-pink-200/60 bg-white/70 px-4 py-2 font-extrabold text-[#7a1036]"
            title="Música"
          >
            {musicOn ? "🔊 Música" : "🔇 Música"}
          </button>
        </div>
      </div>

      {/* Envelope */}
      <div className="mt-6 sm:mt-8 flex justify-center">
        <motion.div
          className="relative w-full max-w-[560px] h-[340px] sm:h-[360px] cursor-pointer select-none"
          style={{ perspective: 1000 }}
          onClick={() => setOpened(true)}
          whileTap={{ scale: 0.985 }}
          role="button"
          tabIndex={0}
        >
          {/* Envelope body */}
          <div className="absolute inset-0 rounded-3xl border border-pink-200/50 bg-white/70 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,.12)]" />

          {/* Flap */}
          <motion.div
            className="absolute left-0 right-0 top-0 h-[62%] rounded-t-3xl rounded-b-2xl border border-pink-200/50 border-b-0 bg-gradient-to-br from-pink-200/35 to-pink-100/25 shadow-[0_18px_40px_rgba(0,0,0,.08)]"
            style={{ transformOrigin: "top" }}
            animate={opened ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
          />

          {/* Paper */}
          <motion.div
            className="absolute left-3 right-3 sm:left-5 sm:right-5 top-[86px] sm:top-[96px] h-[300px] sm:h-[300px] rounded-2xl border border-pink-200/40 bg-white/90 shadow-[0_26px_90px_rgba(0,0,0,.16)] overflow-hidden"
            initial={{ y: 30, opacity: 0 }}
            animate={opened ? { y: -90, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: opened ? 0.15 : 0,
            }}
            onClick={(e) => opened && e.stopPropagation()}
          >
            <div className="h-full overflow-auto p-4 sm:p-5">
              <div className="font-extrabold text-base sm:text-lg">
                Feliz San Valentín 💖
              </div>

              <p className="mt-2 text-[15px] sm:text-[15.5px] leading-relaxed opacity-90">
                {to}, no quería dejar que este día pasara como si fuera uno más.
                <br /><br />
                No sé si esto cuenta como “romántico” o “atrevido”… pero sí sé que es sincero:
                <b> me encantas</b>.
                <br /><br />
                Me gusta cómo eres, cómo hablas, cómo te ríes… y cómo sin darte cuenta haces
                que el día se sienta más ligero.
                <br /><br />
                Si te parece, lo hacemos simple: un café, una conversación sin prisa…
                y que el resto se vaya dando. 😉
              </p>

              <div className="mt-4 flex justify-end gap-2 opacity-90">
                <span>— Con intención,</span>
                <b>Yo tu amor querido</b>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  className="rounded-2xl px-5 py-3 font-extrabold text-white shadow-[0_10px_25px_rgba(255,77,141,.28)] bg-gradient-to-br from-pink-500 to-pink-400 text-center"
                  href={backUrl}
                  onClick={() => {
                    // Guardar tiempo actual si la música está sonando
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
                  }}
                >
                  Volver a la página 💘
                </a>

                <button
                  className="rounded-2xl border border-pink-200/70 bg-white/70 px-5 py-3 font-extrabold text-[#7a1036]"
                  type="button"
                  onClick={() => setOpened(false)}
                >
                  Cerrar sobre
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hint */}
          {!opened && (
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-pink-200/40 bg-white/70 backdrop-blur-md px-4 py-3 text-center font-extrabold shadow-[0_14px_40px_rgba(0,0,0,.08)]">
              Toca para abrir ✨
            </div>
          )}
        </motion.div>
      </div>

      {/* Name bar */}
      <div className="mx-auto mt-5 w-full max-w-[560px] grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <input
          className="w-full rounded-2xl border border-pink-200/60 bg-white/70 px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-pink-200/40"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pon su nombre aquí (opcional)"
          maxLength={24}
        />
      </div>
    </div>
  );
}
