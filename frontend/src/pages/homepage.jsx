import { useRef, useState } from "react";
import { Room } from "livekit-client";

export default function HomePage() {
  const roomRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const log = (msg) => {
    setLogs((l) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...l,
    ]);
  };

  const toggleMic = async () => {
    if (connected) {
      await roomRef.current?.disconnect();
      setConnected(false);
      setListening(false);
      setSpeaking(false);
      log("Session ended");
      return;
    }

    try {
      setLoading(true);
      log("Requesting access token");

      const res = await fetch("http://127.0.0.1:3001/token");
      const { token } = await res.json();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      room.on("connected", () => {
        setConnected(true);
        setListening(true);
        log("LiveKit connected");
      });

      room.on("disconnected", () => {
        setConnected(false);
        setListening(false);
        setSpeaking(false);
        log("Disconnected");
      });

      room.on("trackSubscribed", () => {
        setSpeaking(true);
        log("Agent speaking");
      });

      room.on("trackUnsubscribed", () => {
        setSpeaking(false);
        log("Agent silent");
      });

      await room.connect(
        "wss://ai-voice-assistant-apbhz86s.livekit.cloud",
        token
      );

      await room.localParticipant.enableMicrophone();
      log("Microphone ready");
    } catch (e) {
      console.error(e);
      log("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex overflow-hidden">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:32px_32px]" />

      {/* LEFT PANEL */}
      <aside className="relative w-80 p-5 border-r border-white/10 backdrop-blur-xl bg-black/40 z-10">
        <h2 className="text-lg font-semibold mb-4">AI Control Panel</h2>

        <div className="space-y-3 text-sm">
          <Status label="LiveKit" ok={connected} />
          <Status label="Microphone" ok={listening} />
          <Status label="Agent" value={speaking ? "Speaking" : listening ? "Listening" : "Idle"} />
        </div>

        <div className="mt-6">
          <h3 className="text-xs text-zinc-400 mb-2">SYSTEM LOGS</h3>
          <div className="bg-black/60 rounded-xl p-3 h-[60vh] overflow-y-auto text-xs space-y-1 border border-white/10">
            {logs.length === 0 && (
              <div className="text-zinc-500">No activity yet…</div>
            )}
            {logs.map((l, i) => (
              <div key={i} className="text-zinc-300">
                {l}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        {/* AMBIENT GLOW */}
        <div
          className={`absolute w-[600px] h-[600px] rounded-full blur-3xl transition
          ${connected ? "bg-green-500/20" : "bg-white/5"}`}
        />

        {/* CORE */}
        <div className="relative flex flex-col items-center">
          {/* STATUS CHIP */}
          <div className="mb-6 px-4 py-1 rounded-full text-xs tracking-wide bg-white/10 border border-white/20">
            {connected ? "LIVE SESSION" : "STANDBY MODE"}
          </div>

          {/* LISTENING RINGS */}
          {listening && (
            <>
              <Ring delay="0s" />
              <Ring delay="0.6s" />
              <Ring delay="1.2s" />
            </>
          )}

          {/* MIC */}
          <button
            onClick={toggleMic}
            disabled={loading}
            className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center text-5xl
              transition-all duration-300
              ${
                connected
                  ? "bg-green-500 text-black shadow-[0_0_80px_rgba(34,197,94,0.7)] scale-105"
                  : "bg-zinc-800 hover:scale-105 hover:bg-zinc-700"
              }`}
          >
            {loading ? "⏳" : connected ? "🎙️" : "🎤"}
          </button>

          {/* EQ */}
          {listening && (
            <div className="flex gap-1 mt-6">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-6 bg-green-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {/* TEXT */}
          <div className="mt-6 text-2xl font-semibold tracking-wide">
            {speaking
              ? "Agent Speaking…"
              : listening
              ? "Listening…"
              : "AI Voice Assistant"}
          </div>

          <div className="mt-2 text-sm text-zinc-400">
            {connected
              ? "Natural conversation enabled"
              : "Tap the microphone to begin"}
          </div>

          {/* TOOL DOCK */}
          <div className="mt-10 flex gap-4">
            <Tool label="Skills" />
            <Tool label="Memory" />
            <Tool label="Analytics" />
            <Tool label="Debug" />
            <Tool label="Settings" />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- UI PARTS ---------- */

function Status({ label, ok, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-400">{label}</span>
      {value ? (
        <span>{value}</span>
      ) : (
        <span className={ok ? "text-green-400" : "text-red-400"}>
          {ok ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
}

function Ring({ delay }) {
  return (
    <div
      className="absolute w-48 h-48 rounded-full border border-green-400/30 animate-ping"
      style={{ animationDelay: delay }}
    />
  );
}

function Tool({ label }) {
  return (
    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 transition cursor-pointer">
      {label}
    </div>
  );
}
