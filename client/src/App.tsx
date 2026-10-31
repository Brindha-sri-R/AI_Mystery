import {useEffect, useMemo, useState, type FormEvent, type ReactNode} from "react";
import {Link, Route, Routes, useNavigate, useParams} from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, Clock3,
  Eye, FileText, Fingerprint, Image as ImageIcon, LockKeyhole, MapPin,
  MessageSquare, Shield, Sparkles, UserRound, Video, X,
  type LucideIcon,
} from "lucide-react";
import {api} from "./lib/api";
import type {CaseResult, EvidenceItem, EvidenceType, PublicCase} from "@mystery/shared";
import {BlackoutTransition, PointerGlow, resolveScene, SceneArtwork} from "./components/Atmosphere";

const evidenceIcons: Record<EvidenceType, LucideIcon> = {
  chat: MessageSquare,
  witness: UserRound,
  timeline: Clock3,
  image: ImageIcon,
  cctv_log: Video,
  physical: Fingerprint,
  document: FileText,
};

const wait = (duration: number) => new Promise(resolve => window.setTimeout(resolve, duration));

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Mystery Room home">
      <span className="brand-mark"><Eye size={17}/></span>
      <span className="brand-wording">MYSTERY ROOM</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="header">
      <Brand/>
      <div className="header-right">
        <span className="privacy"><LockKeyhole size={13}/> FICTIONAL MYSTERIES</span>
        <span className="header-dot" aria-hidden="true"/>
        <Link to="/#how-it-works">HOW IT WORKS</Link>
      </div>
    </header>
  );
}

function FictionNotice() {
  return (
    <div className="fiction-notice">
      <span className="notice-pulse" aria-hidden="true"/>
      <span>Fictional mysteries, made from your ideas.</span>
    </div>
  );
}

function Layout({children}: {children: ReactNode}) {
  return (
    <div className="app-shell">
      <PointerGlow/>
      <div className="ambient-grain" aria-hidden="true"/>
      <Header/>
      {children}
      <footer className="footer">
        <Brand/>
        <span className="footer-thought">The dark keeps no secrets forever.</span>
        <span className="footer-mark">FICTION ONLY · 2026</span>
      </footer>
    </div>
  );
}

function Eyebrow({children}: {children: ReactNode}) {
  return <div className="eyebrow"><span className="eyebrow-line" aria-hidden="true"/>{children}</div>;
}

function Landing() {
  return (
    <Layout>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <Eyebrow>A MYSTERY MADE FOR YOU</Eyebrow>
            <h1>Your idea.<br/>Your <em>mystery.</em></h1>
            <p className="hero-text">Create a case, follow the clues, and decide who did it.</p>
            <Link to="/create" className="button button-primary">Create a mystery <ArrowRight size={17}/></Link>
            <div className="hero-meta">
              <span><span className="meta-dot" aria-hidden="true"/> A short, story-driven investigation</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Illustration of a fictional observatory at night">
            <SceneArtwork scene="observatory"/>
            <div className="visual-vignette" aria-hidden="true"/>
            <div className="hero-file-card">
              <div className="file-card-top"><span>CASE FILE</span><span className="status-signal"><i/> OPEN</span></div>
              <div className="file-card-rule"/>
              <span className="file-card-kicker">FICTIONAL MYSTERY</span>
              <h2>The star chart<br/>that vanished</h2>
              <div className="file-card-bottom"><span>5 suspects</span><span>8 clues</span></div>
            </div>
            <div className="floating-clue clue-message"><b>“I never left the west wing.”</b></div>
            <div className="floating-clue clue-signal"><b>21:40 · Camera signal lost</b></div>
          </div>
        </section>

        <section className="ticker" aria-label="Investigation steps">
          <span>Create</span><i>·</i><span>Investigate</span><i>·</i><span>Accuse</span>
        </section>

        <section id="how-it-works" className="process section-wrap">
          <div className="section-kicker">HOW IT WORKS</div>
          <div className="process-head">
            <h2>Three steps<br/>to <em>the truth.</em></h2>
            <p>Start with a story idea. Explore the evidence. Make your final accusation.</p>
          </div>
          <div className="steps">
            <article><span className="step-no">01</span><Sparkles/><h3>Set the scene</h3><p>A person, a place, a feeling that something is wrong. That’s enough to begin.</p></article>
            <article><span className="step-no">02</span><Fingerprint/><h3>Study what’s left</h3><p>Meet the suspects. Turn over every clue. Notice what does not belong.</p></article>
            <article><span className="step-no">03</span><BadgeCheck/><h3>Make your accusation</h3><p>Commit to your theory. When the lights return, see if the evidence agrees.</p></article>
          </div>
          <div className="process-bottom"><span>Your choices shape the case.</span><Link to="/create">Start a case <ArrowRight size={15}/></Link></div>
        </section>

        <section className="evidence-preview">
          <div className="preview-copy">
            <Eyebrow>FOLLOW THE CLUES</Eyebrow>
            <h2>Every detail<br/>can change <em>the story.</em></h2>
            <p>Read statements, check the timeline, and open evidence for more detail before you accuse.</p>
            <Link to="/create" className="text-link">Make your own case <ArrowRight size={16}/></Link>
          </div>
          <div className="preview-cards" aria-label="Examples of fictional clues">
            <article className="preview-card card-note"><span className="card-label"><MessageSquare size={13}/> WITNESS NOTE</span><p>“I thought the east door was still locked.”</p><small>9:14 PM</small></article>
            <article className="preview-card card-log"><span className="card-label"><Video size={13}/> CAMERA LOG</span><div className="log-row"><i/>21:32 <span>Hallway clear</span></div><div className="log-row"><i/>21:40 <span>Signal lost</span></div></article>
          </div>
        </section>

        <section className="final-cta">
          <Eyebrow>READY TO PLAY?</Eyebrow>
          <h2>Make a mystery<br/>from <em>your idea.</em></h2>
          <Link to="/create" className="button button-primary">Start creating <ArrowRight size={17}/></Link>
          <span className="cta-note"><LockKeyhole size={13}/> Fictional, private, and made for play.</span>
        </section>
      </main>
      <FictionNotice/>
    </Layout>
  );
}

function CreateCasePage() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState("");
  const [setting, setSetting] = useState("Let AI decide");
  const [tone, setTone] = useState("Psychological suspense");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scene = useMemo(() => resolveScene(`${seed} ${setting}`), [seed, setting]);
  const trimmedLength = seed.trim().length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedLength < 30 || trimmedLength > 1000) return;
    setBusy(true);
    setError("");
    try {
      const {case: createdCase} = await api.create({
        storySeed: seed.trim(),
        setting,
        tone,
        difficulty,
        evidencePreferences: [],
      });
      sessionStorage.setItem(`case:${createdCase.id}`, JSON.stringify(createdCase));
      await wait(700);
      navigate(`/case/${createdCase.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The case did not open. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Layout>
      <main className="create-page">
        <aside className="create-aside">
          <Link to="/" className="back-link"><ArrowLeft size={14}/> BACK TO THE ROOM</Link>
          <div className="create-scene"><SceneArtwork scene={scene} compact/></div>
          <Eyebrow>THE BEGINNING OF A CASE</Eyebrow>
          <h1>Leave us<br/>the <em>first clue.</em></h1>
          <p>Start with a premise. We’ll build a complete fictional investigation around it.</p>
          <div className="aside-note"><span className="note-icon"><Shield size={17}/></span><div><b>Fiction from the first line.</b><span>Your seed is treated as story material. Names, places, and evidence are invented.</span></div></div>
        </aside>

        <form className="create-form" onSubmit={submit}>
          <div className="form-head"><span>CASE CREATION <i>·</i> STEP 01</span><span className="required-label">* REQUIRED</span></div>
          <div className="seed-label-row"><label htmlFor="seed">Your story idea</label><button className="sample-seed-button" type="button" onClick={() => setSeed("During a storm, a handwritten map disappears from a locked lighthouse. Three people were inside, and each remembers the final hour differently.")}>Try a sample story <Sparkles size={13}/></button></div>
          <textarea id="seed" value={seed} onChange={event => setSeed(event.target.value)} placeholder="A celebrated botanist vanishes during the opening night of a greenhouse that only blooms after dark…" maxLength={1000} aria-describedby="seed-help seed-count"/>
          <div className="textarea-foot"><small id="seed-help">A person, a place, or the thing that feels wrong.</small><span id="seed-count" className={trimmedLength > 1000 ? "over" : ""}>{seed.length}<i> / 1,000</i></span></div>
          {trimmedLength > 0 && trimmedLength < 30 && <p className="field-error">Give the mystery a little more room — at least 30 characters.</p>}

          <div className="form-grid">
            <div className="field"><label htmlFor="setting">Setting</label><div className="select-wrap"><select id="setting" value={setting} onChange={event => setSetting(event.target.value)}>{["Let AI decide", "Mansion", "Office", "Hotel", "College", "Museum", "Small town"].map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15}/></div></div>
            <div className="field"><label htmlFor="tone">Tone</label><div className="select-wrap"><select id="tone" value={tone} onChange={event => setTone(event.target.value)}>{["Classic detective", "Psychological suspense", "Cozy mystery", "Noir", "Lighthearted"].map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15}/></div></div>
          </div>

          <fieldset className="difficulty-field"><legend>Difficulty <span>How closely will you need to look?</span></legend><div className="difficulty-options">{([["easy", "A few guiding lights"], ["medium", "A fair challenge"], ["hard", "Every detail matters"]] as const).map(([value, description]) => <button className={difficulty === value ? "difficulty active" : "difficulty"} type="button" onClick={() => setDifficulty(value)} key={value} aria-pressed={difficulty === value}><span>{value}</span><small>{description}</small>{difficulty === value && <Check size={13}/>}</button>)}</div></fieldset>

          {error && <div className="error-box" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")}>Dismiss</button></div>}
          <button disabled={busy || trimmedLength < 30 || trimmedLength > 1000} className="button button-primary form-submit" type="submit">{busy ? <><span className="spinner"/> The case is opening…</> : <>Enter the dark <ArrowRight size={17}/></>}</button>
          <p className="form-foot"><LockKeyhole size={13}/> Generation can take a moment. Your case stays in this session.</p>
        </form>
      </main>
      <FictionNotice/>
      {busy && <BlackoutTransition kind="create" scene={scene} subject={seed.trim().slice(0, 70)}/>}
    </Layout>
  );
}

function SectionLabel({children, detail}: {children: ReactNode; detail?: ReactNode}) {
  return <div className="section-label"><span>{children}</span>{detail && <i>{detail}</i>}</div>;
}

function ResultReveal({result, caseData}: {result: CaseResult; caseData: PublicCase}) {
  const selectedSuspect = caseData.suspects.find(suspect => suspect.id === result.selectedSuspectId);
  return (
    <section className={`result-panel ${result.isCorrect ? "result-panel--solved" : "result-panel--misread"}`} aria-live="polite">
      <div className="result-topline"><span className={`result-stamp ${result.isCorrect ? "correct" : "incorrect"}`}>{result.isCorrect ? "CASE SOLVED" : "WRONG ACCUSATION"}</span><span className="result-index">THE REVEAL / 01</span></div>
      <div className="result-verdict-icon">{result.isCorrect ? <BadgeCheck size={24}/> : <Eye size={24}/>}</div>
      <p className="result-kicker">{result.isCorrect ? "YOU READ THE ROOM" : "THE ROOM MISLED YOU"}</p>
      <h2>{result.isCorrect ? <>You found the <em>truth.</em></> : <>You were <em>wrong.</em></>}</h2>
      <p className="result-outcome">{result.isCorrect ? "Your accusation was right." : `Your accusation against ${selectedSuspect?.name ?? "your suspect"} was not right.`}</p>
      <div className="culprit-reveal"><span>THE CULPRIT WAS</span><b>{result.culprit.name}</b><small>{result.culprit.profile}</small></div>
      <p className="result-lede">{result.motive} {result.opportunity}</p>
      <div className="reconstruction"><span>HOW IT HAPPENED</span><p>{result.reconstruction}</p></div>
      <div className="reasoning-list"><SectionLabel detail="EVIDENCE REVISITED">THE CLUES THAT MATTERED</SectionLabel>{result.reasoning.map((item, index) => {
        const evidence = caseData.evidence.find(entry => entry.id === item.evidenceId);
        return <article key={item.evidenceId}><b>0{index + 1}<i>{evidence?.title ?? item.evidenceId}</i></b><p>{item.explanation}</p></article>;
      })}</div>
      <div className="red-herring"><span>THE RED HERRING</span><p>{result.redHerringExplanation}</p></div>
      <Link to="/create" className="button button-primary">Open another case <ArrowRight size={17}/></Link>
      <p className="result-fiction"><Shield size={13}/> This mystery and all its evidence are fictional.</p>
    </section>
  );
}

function EvidenceDialog({item, caseData, onClose}: {item: EvidenceItem; caseData: PublicCase; onClose: () => void}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const relatedNames = item.relatedSuspectIds.map(id => caseData.suspects.find(suspect => suspect.id === id)?.name).filter(Boolean);
  const Icon = evidenceIcons[item.type];
  return (
    <div className="overlay" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) onClose();}}>
      <div className="evidence-dialog" role="dialog" aria-modal="true" aria-labelledby="evidence-title">
        <button className="close-dialog" onClick={onClose} aria-label="Close evidence"><X size={18}/></button>
        <div className="dialog-icon"><Icon size={17}/></div>
        <SectionLabel detail={item.id.replace("_", " ").toUpperCase()}>{item.sourceLabel.toUpperCase()}</SectionLabel>
        <h2 id="evidence-title">{item.title}</h2><p className="evidence-summary">{item.summary}</p>
        <div className="evidence-paper"><span className="paper-label">TRANSCRIPT / FICTIONAL RECORD</span>{item.content}</div>
        <div className="related"><b>CONNECTED TO</b><span>{relatedNames.join(" · ") || "No named persons"}</span></div>
      </div>
    </div>
  );
}

function CaseRoom() {
  const {id = ""} = useParams();
  const [caseData, setCaseData] = useState<PublicCase | null>(null);
  const [result, setResult] = useState<CaseResult | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [evidence, setEvidence] = useState<EvidenceItem | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    let active = true;
    const cacheKey = `case:${id}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) setCaseData(JSON.parse(cached) as PublicCase);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
    api.get(id).then(({case: loadedCase, result: loadedResult}) => {
      if (!active) return;
      setCaseData(loadedCase);
      sessionStorage.setItem(cacheKey, JSON.stringify(loadedCase));
      if (loadedResult) setResult(loadedResult);
    }).catch(requestError => {
      if (active && !caseData) setError(requestError instanceof Error ? requestError.message : "This case is unavailable.");
    }).finally(() => {if (active) setInitialLoading(false);});
    return () => {active = false;};
  }, [id]);

  const scene = useMemo(() => caseData ? resolveScene([caseData.setting, caseData.title, caseData.briefing.location, caseData.briefing.incident].join(" ")) : "unknown", [caseData]);

  async function accuse() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    setConfirm(false);
    try {
      const {result: revealed} = await api.accuse(id, selected);
      setResult(revealed);
      await wait(900);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Your accusation could not be recorded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (initialLoading && !caseData) return <Layout><div className="loading-case"><span className="spinner"/> The case file is opening…</div></Layout>;
  if (error && !caseData) return <Layout><div className="empty-state"><span>CASE FILE NOT FOUND</span><h1>That trail ends here.</h1><p>{error}</p><Link to="/" className="button button-primary">Return to the room <ArrowRight size={16}/></Link></div></Layout>;
  if (!caseData) return null;

  return (
    <Layout>
      <main className={`investigation scene-theme scene-theme--${scene}`}>
        <div className="case-top"><Link to="/" className="back-link"><ArrowLeft size={14}/> HOME</Link><span className="case-status"><i aria-hidden="true"/>{result ? "Case closed" : "Investigation open"}</span></div>
        <section className="case-heading">
          <div className="case-heading__art"><SceneArtwork scene={scene} compact/></div>
          <div className="case-heading__content"><Eyebrow>{caseData.setting}</Eyebrow><h1>{caseData.title}</h1><p>{caseData.briefing.incident}</p><div className="case-location"><MapPin size={13}/>{caseData.briefing.location}<span>·</span>{caseData.briefing.timeWindow}</div></div>
        </section>

        {result ? <ResultReveal result={result} caseData={caseData}/> : (
          <div className="case-columns">
            <div className="case-main">
              <section className="case-brief dossier-panel"><SectionLabel>THE BRIEFING</SectionLabel><ul>{caseData.briefing.knownFacts.map((fact, index) => <li key={`${index}-${fact}`}><span>{String(index + 1).padStart(2, "0")}</span>{fact}</li>)}</ul></section>
              <section className="suspects dossier-panel"><SectionLabel>Suspects</SectionLabel><div className="suspect-list">{caseData.suspects.map((suspect, index) => {
                const isSelected = selected === suspect.id;
                return <article className={`suspect-card${isSelected ? " suspect-card--selected" : ""}`} key={suspect.id}><div className="suspect-card__top"><span className="suspect-no">0{index + 1}</span><button className="suspect-select" type="button" onClick={() => setSelected(isSelected ? "" : suspect.id)} aria-pressed={isSelected} aria-label={`${isSelected ? "Remove" : "Select"} ${suspect.name} for accusation`}>{isSelected ? <Check size={14}/> : <ArrowUpRight size={14}/>}</button></div><h3>{suspect.name}</h3><span className="suspect-role">{suspect.role}</span><p>{suspect.profile}</p><div className="alibi"><span>STATED ALIBI</span>{suspect.alibi}</div></article>;
              })}</div></section>
              <section className="timeline dossier-panel"><SectionLabel>Timeline</SectionLabel><div className="timeline-list">{caseData.timeline.map((event, index) => <article className="timeline-row" key={event.id}><span className="timeline-time">{event.timestamp}</span><span className="timeline-node" aria-hidden="true"><i/></span><p>{event.description}</p><span className="timeline-index">0{index + 1}</span></article>)}</div></section>
            </div>

            <aside className="case-sidebar">
              <section className="evidence-board dossier-panel"><SectionLabel>Evidence</SectionLabel><p className="board-hint">Open a clue to inspect it.</p>{caseData.evidence.map((item, index) => {const Icon = evidenceIcons[item.type];return <button className="evidence-card" key={item.id} onClick={() => setEvidence(item)}><span className="evidence-index">{String(index + 1).padStart(2, "0")}</span><span className="evidence-icon"><Icon size={16}/></span><span className="evidence-content"><b>{item.title}</b><small>{item.sourceLabel}</small></span><ArrowUpRight className="evidence-open" size={15}/></button>;})}</section>
              <section className="accusation dossier-panel"><SectionLabel>Your accusation</SectionLabel><p>Who do you think did it?</p><div className="select-wrap"><select aria-label="Select a suspect to accuse" value={selected} onChange={event => setSelected(event.target.value)}><option value="">Choose a suspect</option>{caseData.suspects.map(suspect => <option key={suspect.id} value={suspect.id}>{suspect.name} — {suspect.role}</option>)}</select><ChevronDown size={15}/></div>{error && <div className="error-box" role="alert">{error}</div>}<button className="button button-primary accuse-btn" type="button" disabled={!selected || busy} onClick={() => setConfirm(true)}>Review accusation <ArrowRight size={16}/></button><small className="final-note"><LockKeyhole size={12}/> You can only accuse once.</small></section>
            </aside>
          </div>
        )}
        <FictionNotice/>
      </main>
      {confirm && <div className="overlay" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) setConfirm(false);}}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><button className="close-dialog" onClick={() => setConfirm(false)} aria-label="Close confirmation"><X size={18}/></button><Eyebrow>THE FINAL DECISION</Eyebrow><h2 id="confirm-title">Say their name<br/>and <em>mean it.</em></h2><p>This is your one final accusation. When you continue, the case will close and the evidence will answer.</p><button className="button button-primary" type="button" onClick={accuse}>Accuse {caseData.suspects.find(suspect => suspect.id === selected)?.name ?? "this suspect"} <ArrowRight size={16}/></button><button className="cancel-link" type="button" onClick={() => setConfirm(false)}>Not yet — return to the evidence</button></div></div>}
      {evidence && <EvidenceDialog item={evidence} caseData={caseData} onClose={() => setEvidence(null)}/>}
      {busy && <BlackoutTransition kind="accuse" scene={scene} subject={caseData.title}/>}
    </Layout>
  );
}

function NotFound() {
  return <Layout><div className="empty-state"><span>NOT IN THE CASE FILE</span><h1>This page is a dead end.</h1><Link to="/" className="button button-primary">Back to the room <ArrowRight size={16}/></Link></div></Layout>;
}

export default function App() {
  return <Routes><Route path="/" element={<Landing/>}/><Route path="/create" element={<CreateCasePage/>}/><Route path="/case/:id" element={<CaseRoom/>}/><Route path="*" element={<NotFound/>}/></Routes>;
}
