import {useEffect, useRef, useState} from "react";
import {Eye, Fingerprint, ScanLine} from "lucide-react";

export type Scene = "observatory" | "mansion" | "woods" | "museum" | "hotel" | "waterfront" | "city" | "unknown";

export function resolveScene(text: string): Scene {
  const value = text.toLocaleLowerCase();
  if (/observatory|astronom|telescope|star chart|planetarium|observatorio|खगोलीय/.test(value)) return "observatory";
  if (/mansion|estate|manor|castle|house|mansion|haveli|हवेली/.test(value)) return "mansion";
  if (/forest|woods|garden|greenhouse|woods|jungle|forest|जंगल|वन/.test(value)) return "woods";
  if (/museum|gallery|painting|archive|exhibit|museum|संग्रहालय/.test(value)) return "museum";
  if (/hotel|inn|motel|resort|hotel|होटल/.test(value)) return "hotel";
  if (/harbor|harbour|pier|lighthouse|coast|sea|ocean|waterfront|समुद्र/.test(value)) return "waterfront";
  if (/office|station|subway|city|metro|street|शहर/.test(value)) return "city";
  return "unknown";
}

export function PointerGlow() {
  const frame = useRef<number | null>(null);
  const point = useRef({x: 0, y: 0});

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      point.current = {x: event.clientX, y: event.clientY};
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${point.current.x}px`);
        document.documentElement.style.setProperty("--pointer-y", `${point.current.y}px`);
        frame.current = null;
      });
    };
    window.addEventListener("pointermove", onMove, {passive: true});
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return <div className="pointer-glow" aria-hidden="true"/>;
}

export function SceneArtwork({scene, compact = false}: {scene: Scene; compact?: boolean}) {
  return (
    <div className={`scene-art scene-art--${scene}${compact ? " scene-art--compact" : ""}`} aria-hidden="true">
      <div className="scene-art__moon"/>
      <div className="scene-art__halo"/>
      <div className="scene-art__mist scene-art__mist--one"/>
      <div className="scene-art__mist scene-art__mist--two"/>
      <svg className="scene-art__landscape" viewBox="0 0 780 480" preserveAspectRatio="xMidYMid slice">
        <path className="scene-art__far" d="M0 305 74 262l52 24 63-68 83 49 63-91 74 63 62-47 81 68 71-41 67 59 90-42v244H0Z"/>
        <path className="scene-art__near" d="M0 365 112 324l87 27 81-51 78 31 81-34 104 53 86-36 82 39 69-22v149H0Z"/>
        <g className="scene-art__building">
          <path d="M286 480V260l104-76 104 76v220Z"/>
          <path d="M262 267 390 164l128 103"/>
          <path d="M360 480V304a30 30 0 0 1 60 0v176"/>
          <path d="M315 295h35v47h-35zM430 295h35v47h-35zM315 370h35v47h-35zM430 370h35v47h-35z"/>
          <path className="scene-art__beam" d="m427 191 188-95-150 156"/>
        </g>
        <g className="scene-art__trees">
          <path d="M88 480V335m0-87-44 76h31l-43 61h38l-35 51h106l-35-51h38l-43-61h31z"/>
          <path d="M678 480V314m0-99-52 92h38l-48 65h42l-42 59h124l-42-59h42l-48-65h38z"/>
        </g>
        <g className="scene-art__windows"><path d="M326 309h13v24h-13zm115 0h13v24h-13zm-115 76h13v24h-13zm115 0h13v24h-13z"/></g>
      </svg>
      <div className="scene-art__grain"/>
      <div className="scene-art__scanline"/>
    </div>
  );
}

const loadingLines = {
  create: ["The lights are going out", "Something is taking shape", "Following the last trace"],
  accuse: ["Your accusation is sealed", "The evidence is answering", "The room remembers"],
} as const;

export function BlackoutTransition({kind, scene, subject}: {kind: "create" | "accuse"; scene: Scene; subject?: string}) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setLineIndex(index => (index + 1) % loadingLines[kind].length), 2500);
    return () => window.clearInterval(timer);
  }, [kind]);

  return (
    <div className={`blackout-curtain blackout-curtain--${kind}`} role="status" aria-live="polite" aria-label={loadingLines[kind][lineIndex]}>
      <SceneArtwork scene={scene} compact/>
      <div className="blackout-vignette"/>
      <div className="blackout-light"/>
      <div className="blackout-content">
        <div className="blackout-mark" aria-hidden="true">
          {kind === "create" ? <Eye size={22}/> : <Fingerprint size={21}/>}
          <ScanLine className="blackout-mark__scan" size={42}/>
        </div>
        <p className="blackout-kicker">{kind === "create" ? "CASE FILE IN PROGRESS" : "FINAL ACCUSATION RECORDED"}</p>
        <h2 key={lineIndex}>{loadingLines[kind][lineIndex]}<span className="ellipsis" aria-hidden="true">…</span></h2>
        {subject && <p className="blackout-subject">{subject}</p>}
        <div className="blackout-signal" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        <p className="blackout-foot">{kind === "create" ? "A fictional mystery is assembling around your story." : "The truth will return with the lights."}</p>
      </div>
    </div>
  );
}
