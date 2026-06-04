// Additional views for the real app — quizzes index, take-quiz, schedule, grades, flashcards

// ─────────────── Shared utility

function Field({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ─────────────── Subject picker modal

const MODE_LABELS = {
  flashcard: "Flashcards", mcq: "Multiple choice", type: "Type the answer",
  truefalse: "True / False", keyconcepts: "Key Concepts", written: "Written recall",
};

function SubjectPickerModal({ mode, onPick, onClose }) {
  const store = useNbStore();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12,
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)", width: 420, maxHeight: "72vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{MODE_LABELS[mode]}</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 20, marginTop: 2 }}>Pick a subject to study</div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {SUBJECTS.map(s => {
            const noteCount = (store.notesFor(s.id) || []).length + (notesForSubject(s.id) || []).length;
            return (
              <div key={s.id} onClick={() => onPick("subject-" + s.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                  border: "1px solid var(--hairline)", borderRadius: 7, cursor: "pointer",
                  background: "var(--bg-2)", opacity: noteCount === 0 ? 0.5 : 1 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                    {noteCount > 0 ? `${noteCount} note${noteCount !== 1 ? "s" : ""} · study from topics` : "No notes yet — add notes first"}
                  </div>
                </div>
                <span style={{ color: "var(--ink-3)" }}>{Ico.arrow}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--hairline)" }}>
          <button className="sn-btn ghost" onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────── Quizzes index

function QuizzesContent({ onTakeQuiz }) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [picker, setPicker] = React.useState(null); // mode string or null

  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  const userQuizzes = nbGetQuizzes();
  const hasSampleData = QUIZZES_UPCOMING.length > 0;
  const past = hasSampleData ? [
    { id: "p1", subject: "alg2",      title: "Trig Identities",       score: 8,  total: 10, when: "Last week" },
    { id: "p2", subject: "ap-bio",    title: "Photosynthesis",         score: 17, total: 20, when: "2 weeks ago" },
    { id: "p3", subject: "us-hist",   title: "Constitutional Conv.",   score: 14, total: 20, when: "Apr 28" },
    { id: "p4", subject: "spanish-3", title: "Vocab U5",               score: 13, total: 15, when: "Apr 22" },
  ] : [];

  const totalUpcoming = QUIZZES_UPCOMING.length + userQuizzes.length;

  const launchMode = (mode, deckId) => onTakeQuiz(mode, deckId);
  const openPicker = (mode) => setPicker(mode);

  const STUDY_MODES = [
    { mode: "flashcard",   icon: Ico.cards, label: "Flashcards",      desc: "Flip · spaced repetition",     accent: "var(--accent)" },
    { mode: "mcq",         icon: Ico.quiz,  label: "Multiple choice", desc: "Auto-generated from any deck",  accent: "var(--info)" },
    { mode: "type",        icon: "Aa",      label: "Type the answer", desc: "Type the definition",           accent: "var(--plum)" },
    { mode: "truefalse",   icon: "T/F",     label: "True / False",    desc: "Is this definition correct?",   accent: "var(--done)" },
    { mode: "keyconcepts", icon: Ico.note,  label: "Key Concepts",    desc: "Study reference sheet",         accent: "var(--ink-2)" },
    { mode: "written",     icon: Ico.book,  label: "Written recall",  desc: "Free-write what you know",      accent: "var(--ink-3)" },
  ];

  return (
    <>
      {picker && (
        <SubjectPickerModal
          mode={picker}
          onPick={(deckId) => { setPicker(null); launchMode(picker, deckId); }}
          onClose={() => setPicker(null)}
        />
      )}

      <PageHeader
        eyebrow={totalUpcoming > 0 ? `${totalUpcoming} upcoming · ${past.length} taken this term` : "Practice anytime · all subjects"}
        title="Study &"
        italic="practice."
        meta="Pick a mode and a deck — quiz yourself on anything"
        actions={<button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "quiz" } }))}>+ Add quiz day</button>}
      />

      {totalUpcoming > 0 && <>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>Upcoming</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 32 }}>
          {[...QUIZZES_UPCOMING, ...userQuizzes].map((q) => {
            const s = subjectBy(q.subject) || SUBJECTS[0];
            const deckId = deckForSubject(q.subject);
            return (
              <div key={q.id} className="sn-card" style={{ borderLeft: `3px solid ${s.color}`, cursor: "pointer" }}
                onClick={() => window.location.hash = "#/quiz-detail/" + q.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short} · {q.when || q.dateStr || "TBD"}</div>
                  {q.length && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{q.length}</div>}
                </div>
                <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 20, lineHeight: 1.2 }}>{q.title}</div>
                {q.confidence != null && <div style={{ marginTop: 10, marginBottom: 12 }}><ConfidenceMeter value={q.confidence} /></div>}
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button className="sn-btn primary" onClick={e => { e.stopPropagation(); window.location.hash = "#/quiz-detail/" + q.id; }} style={{ flex: 1, justifyContent: "center" }}>Open →</button>
                  <button className="sn-btn" title="Flashcards" onClick={e => { e.stopPropagation(); launchMode("flashcard", "subject-" + q.subject); }} style={{ padding: "7px 10px" }}>{Ico.cards}</button>
                  <button className="sn-btn" title="Multiple choice" onClick={e => { e.stopPropagation(); launchMode("mcq", "subject-" + q.subject); }} style={{ padding: "7px 10px" }}>{Ico.quiz}</button>
                </div>
              </div>
            );
          })}
        </div>
      </>}

      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 14px" }}>Study modes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        {STUDY_MODES.map(({ mode, icon, label, desc, accent }) => (
          <div key={mode} onClick={() => openPicker(mode)}
            style={{ padding: "18px 16px", background: "var(--surface)", border: "1px solid var(--hairline)",
              borderRadius: 8, cursor: "pointer", transition: "border-color 0.15s", borderTop: `3px solid ${accent}` }}>
            <div style={{ fontSize: typeof icon === "string" ? 14 : 16, color: accent, marginBottom: 10, fontFamily: "var(--f-mono)", fontWeight: 600 }}>
              {icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{desc}</div>
          </div>
        ))}
      </div>

      {past.length > 0 && <>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>Past results</div>
        <div className="sn-card" style={{ padding: 0 }}>
          {past.map((p, i) => {
            const s = subjectBy(p.subject);
            const pct = p.score / p.total;
            return (
              <div key={p.id} onClick={() => openPicker("mcq")}
                style={{ display: "grid", gridTemplateColumns: "8px 1fr auto auto auto", alignItems: "center",
                  gap: 14, padding: "14px 20px", borderBottom: i < past.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
                <div style={{ width: 8, height: 28, borderRadius: 2, background: s.color }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{s.short.toUpperCase()} · {p.when}</div>
                </div>
                <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, color: pct >= 0.8 ? "var(--done)" : pct >= 0.65 ? "var(--accent)" : "var(--danger)" }}>
                  {p.score}<span style={{ color: "var(--ink-3)" }}>/{p.total}</span>
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>{Math.round(pct * 100)}%</div>
                <span style={{ color: "var(--ink-3)" }}>{Ico.arrow}</span>
              </div>
            );
          })}
        </div>
      </>}
    </>
  );
}

function PracticeCard({ icon, title, subtitle, accent, onClick }) {
  return (
    <div onClick={onClick} className="sn-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 8, background: accent, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18 }}>
        {typeof icon === "string" ? icon : icon}
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{subtitle}</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
        START <span>{Ico.arrow}</span>
      </div>
    </div>
  );
}

// ─────────────── Take-a-quiz wrapper with "back" affordance

function TakeQuiz({ type, deckId, onExit }) {
  const Component = type === "flashcard"   ? FlashcardQuiz
                  : type === "mcq"         ? MCQQuiz
                  : type === "type"        ? TypeAnswerQuiz
                  : type === "truefalse"   ? TrueFalseQuiz
                  : type === "keyconcepts" ? KeyConceptsStudy
                  : type === "written"     ? WrittenRecallQuiz
                  : type === "result"      ? QuizResult
                  : FlashcardQuiz;
  return <Component deckId={deckId} onExit={onExit} />;
}


// ─────────────── AI Study Plan — hero, auto-generates on load

function AIStudyPlan() {
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState("");
  const [error, setError] = React.useState("");
  const [generated, setGenerated] = React.useState(false);

  const generate = async () => {
    setLoading(true); setError(""); setPlan(""); setGenerated(false);
    const openHW = [...HOMEWORK, ...nbGetHomework()].filter((h) => !h.done);
    const now = new Date();
    const dayNamesLong = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNamesLong[now.getDay()];
    const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const hwList = openHW.map((h) => {
      const s = subjectBy(h.subject);
      return "- " + s.short + ": \"" + h.title + "\" — due " + h.due + ", est. " + h.est + (h.urgent ? " [URGENT]" : "");
    }).join("\n") || "No open homework.";
    const quizList = QUIZZES_UPCOMING.map((q) => {
      const s = subjectBy(q.subject);
      return "- " + s.short + ": \"" + q.title + "\" on " + q.when + " (confidence " + Math.round(q.confidence * 100) + "%)";
    }).join("\n") || "No upcoming quizzes.";
    const prompt = "You are a study coach for a high school student. Today is " + dateStr + ".\n\nOpen homework:\n" + hwList + "\n\nUpcoming quizzes:\n" + quizList + "\n\nCreate a realistic day-by-day study plan for the rest of this week. For each day (starting with today, " + today + "), suggest what to work on and when (afternoon/evening). Be specific about which assignments to tackle each day and in what order. Keep it concise — one line per task. Format as:\n\n**Today (" + today + ")**\n- Task · time estimate\n\n**Tomorrow**\n- Task · time estimate\n\n...and so on. Max 5 days. End with one motivating sentence.";
    try {
      const text = await aiComplete(prompt);
      setPlan(text || "(no response)");
      setGenerated(true);
    } catch(e) {
      if (e.message === "no-key") { setError("__no-key__"); }
      else if (e.message === "invalid-key") { setError("Invalid API key — update it via the ✦ Connect AI button."); }
      else { setError("Couldn't generate plan right now. Try again in a moment."); }
    } finally { setLoading(false); }
  };

  React.useEffect(() => { if (nbGetApiKey()) { generate(); } }, []);

  const parsedPlan = React.useMemo(() => {
    if (!plan) return { sections: [], trailingNote: "" };
    const sections = [];
    let cur = null;
    let trailingNote = "";
    for (const raw of plan.split("\n")) {
      const line = raw.trim();
      if (line.startsWith("**") && line.endsWith("**")) {
        if (cur) sections.push(cur);
        cur = { heading: line.replace(/\*\*/g, ""), items: [] };
      } else if (cur && line.startsWith("- ")) {
        cur.items.push(line.slice(2));
      } else if (line && cur && !line.startsWith("- ")) {
        trailingNote = line;
      } else if (line && !cur) {
        trailingNote = line;
      }
    }
    if (cur) {
      if (cur.items.length === 0) trailingNote = cur.heading;
      else sections.push(cur);
    }
    return { sections, trailingNote };
  }, [plan]);

  const subjectColorForItem = (text) => {
    const s = SUBJECTS.find(sub =>
      text.toLowerCase().includes(sub.short.toLowerCase()) ||
      text.toLowerCase().includes(sub.name.toLowerCase())
    );
    return s ? s.color : "var(--accent)";
  };

  return (
    <div style={{
      marginBottom: 22,
      border: "1px solid var(--hairline)",
      borderRadius: 10,
      overflow: "hidden",
      background: "var(--surface)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: "linear-gradient(180deg, var(--accent) 0%, var(--plum) 100%)",
        borderRadius: "10px 0 0 10px",
        pointerEvents: "none",
      }} />
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "13px 16px 13px 20px",
          borderBottom: open ? "1px solid var(--hairline)" : "none",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "var(--accent-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, color: "var(--accent)", flexShrink: 0,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--ink)" }}>AI Study Plan</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 1.5 }}>
              {loading ? "Analyzing your workload…" : generated ? "Personalized to your homework & quizzes" : "Day-by-day recommendations, tailored to you"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {generated && !loading && (
            <button className="sn-btn ghost"
              onClick={(e) => { e.stopPropagation(); generate(); }}
              style={{ fontSize: 11, padding: "4px 10px" }}>↻ Refresh</button>
          )}
          {!generated && !loading && !error && (
            <button className="sn-btn"
              onClick={(e) => { e.stopPropagation(); generate(); setOpen(true); }}
              style={{ fontSize: 11, padding: "4px 12px", background: "var(--accent)", color: "white", borderColor: "var(--accent)" }}>
              Generate plan →
            </button>
          )}
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background: "var(--bg-2)", border: "1px solid var(--hairline)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "var(--ink-3)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
          }}>▾</div>
        </div>
      </div>
      {open && (
        <div style={{ padding: "16px 20px" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", color: "var(--ink-2)" }}>
              <div className="ai-dots"><span/><span/><span/></div>
              <style>{`.ai-dots{display:flex;gap:5px}.ai-dots span{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:dot-pulse .9s ease infinite}.ai-dots span:nth-child(2){animation-delay:.15s}.ai-dots span:nth-child(3){animation-delay:.3s}@keyframes dot-pulse{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1.1)}}`}</style>
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13.5 }}>Building your personalized plan…</span>
            </div>
          )}
          {error === "__no-key__" && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              padding: "14px 16px", borderRadius: 8,
              background: "var(--bg-2)", border: "1px dashed var(--hairline)",
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>Connect Claude AI for a smart day-by-day study plan</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  Adapts to your actual homework, urgency, and quiz schedule
                </div>
              </div>
              <button className="sn-btn primary" style={{ flexShrink: 0, fontSize: 12 }}
                onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>
                ✦ Connect AI
              </button>
            </div>
          )}
          {error && error !== "__no-key__" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ color: "var(--accent)", fontSize: 12.5 }}>{error}</div>
              <button className="sn-btn ghost" onClick={generate} style={{ fontSize: 11 }}>Retry</button>
            </div>
          )}
          {plan && (() => {
            const { sections, trailingNote } = parsedPlan;
            if (!sections.length && !trailingNote) return null;
            return (
              <div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(" + Math.min(sections.length, 5) + ", 1fr)",
                  gap: 9,
                  marginBottom: trailingNote ? 12 : 0,
                }}>
                  {sections.map((sec, si) => (
                    <div key={si} style={{
                      padding: "10px 11px", borderRadius: 7,
                      background: "var(--bg-2)", border: "1px solid var(--hairline)",
                      borderTop: "2px solid " + (si === 0 ? "var(--accent)" : "var(--hairline)"),
                    }}>
                      <div style={{
                        fontFamily: "var(--f-mono)", fontSize: 9.5,
                        color: si === 0 ? "var(--accent)" : "var(--ink-3)",
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 9, lineHeight: 1.2,
                      }}>{sec.heading}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {sec.items.length === 0 && (
                          <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--ink-3)" }}>Free day</div>
                        )}
                        {sec.items.map((item, ii) => {
                          const color = subjectColorForItem(item);
                          const dotIdx = item.lastIndexOf("·");
                          const taskText = dotIdx > -1 ? item.slice(0, dotIdx).trim() : item;
                          const timeText = dotIdx > -1 ? item.slice(dotIdx + 1).trim() : "";
                          return (
                            <div key={ii} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 11.5, lineHeight: 1.4 }}>
                              <span style={{ width: 5, height: 5, borderRadius: 1.5, background: color, flexShrink: 0, marginTop: 4 }}/>
                              <div style={{ minWidth: 0 }}>
                                <span style={{ color: "var(--ink)" }}>{taskText}</span>
                                {timeText && (
                                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginLeft: 5 }}>· {timeText}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {trailingNote && (
                  <div style={{
                    paddingTop: 12, borderTop: "1px solid var(--hairline)",
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: 13, color: "var(--ink-2)", textAlign: "center", lineHeight: 1.5,
                  }}>{trailingNote}</div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─────────────── Pomodoro Focus Timer
// ─────────────── Pomodoro Focus Timer

function PomodoroTimer() {
  const WORK_MINS = 25;
  const BREAK_MINS = 5;
  const [phase, setPhase] = React.useState("work");
  const [secondsLeft, setSecondsLeft] = React.useState(WORK_MINS * 60);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);
  const intervalRef = React.useRef(null);

  const totalSecs = phase === "work" ? WORK_MINS * 60 : BREAK_MINS * 60;
  const pct = secondsLeft / totalSecs;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (phase === "work") {
              setSessions((n) => n + 1);
              setPhase("break");
              setSecondsLeft(BREAK_MINS * 60);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Pomodoro done — take a 5-minute break! 🎉" }));
            } else {
              setPhase("work");
              setSecondsLeft(WORK_MINS * 60);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Break over — back to it! 💪" }));
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSecondsLeft(phase === "work" ? WORK_MINS * 60 : BREAK_MINS * 60);
  };

  const skipPhase = () => {
    const next = phase === "work" ? "break" : "work";
    setPhase(next);
    setSecondsLeft(next === "work" ? WORK_MINS * 60 : BREAK_MINS * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const r = 36; const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const accentColor = phase === "work" ? "var(--accent)" : "#27ae60";

  return (
    <div className="sn-card" style={{ display: "flex", gap: 24, alignItems: "center", padding: "18px 24px", marginTop: 20 }}>
      {/* Ring progress */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={44} cy={44} r={r} fill="none" stroke="var(--hairline)" strokeWidth={5} />
          <circle cx={44} cy={44} r={r} fill="none"
            stroke={accentColor}
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: running ? "stroke-dashoffset 0.95s linear" : "none" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          fontFamily: "var(--f-mono)", fontSize: 16, fontWeight: 600, letterSpacing: "0.03em",
          color: running ? accentColor : "var(--ink)",
        }}>
          {display}
        </div>
      </div>

      {/* Label + controls */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 18, marginBottom: 2 }}>
          {phase === "work" ? "Focus session" : "Short break"}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          {phase === "work" ? "25-minute Pomodoro" : "5-minute break"} · {sessions} session{sessions !== 1 ? "s" : ""} completed
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="sn-btn" onClick={() => setRunning((v) => !v)}
            style={{ background: running ? "var(--bg-2)" : accentColor, color: running ? "var(--ink)" : "white", borderColor: accentColor, minWidth: 86, fontSize: 12.5 }}>
            {running ? "⏸ Pause" : (secondsLeft === totalSecs ? "▶ Start" : "▶ Resume")}
          </button>
          <button className="sn-btn ghost" onClick={reset} style={{ fontSize: 12 }}>↺ Reset</button>
          <button className="sn-btn ghost" onClick={skipPhase} style={{ fontSize: 12 }}>
            {phase === "work" ? "→ Break" : "→ Work"}
          </button>
        </div>
      </div>

      {/* Session dots */}
      {sessions > 0 && (
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Sessions</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 72, justifyContent: "center" }}>
            {Array.from({ length: Math.min(sessions, 12) }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: accentColor, opacity: 0.85 }} />
            ))}
          </div>
          {sessions > 12 && <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 4 }}>+{sessions-12} more</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────── Schedule view (full week)

function ScheduleContent() {
  const store = useNbStore();
  const [weekOffset, setWeekOffset] = React.useState(0);

  const now = new Date();
  const isCurrentWeek = weekOffset === 0;

  // Compute Mon of the viewed week
  const viewMonday = new Date(now);
  viewMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  viewMonday.setHours(0, 0, 0, 0);

  // Column dates Mon–Fri
  const colDates = [0, 1, 2, 3, 4].map((off) => {
    const d = new Date(viewMonday);
    d.setDate(viewMonday.getDate() + off);
    return d;
  });

  const todayDayIndex = isCurrentWeek ? ((now.getDay() + 6) % 7) : -1;
  const weekRange = colDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " – " + colDates[4].toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const termInfo = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const month = viewMonday.getMonth();
      const term = month >= 7 ? "Fall" : "Spring";
      const wk = p && p.yearStart ? Math.min(Math.ceil((viewMonday - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : "—";
      const weekLabel = weekOffset === 0 ? "this week" : weekOffset < 0 ? `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? "s" : ""} ago` : `${weekOffset} week${weekOffset > 1 ? "s" : ""} ahead`;
      return `${term} · week ${wk} · ${weekLabel}`;
    } catch { return weekOffset === 0 ? "This week" : weekOffset < 0 ? "Previous week" : "Next week"; }
  })();

  // Pull live homework + quizzes
  const allHW = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);
  const allQuizzes = React.useMemo(() => [...QUIZZES_UPCOMING, ...nbGetQuizzes()], [store.homework]);

  // Map each day to its homework + quiz items
  const dayItems = colDates.map((colDate) => {
    const hw = allHW.filter((h) => {
      if (h.done) return false;
      const d = dueStringToDate(h.due, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    const quizzes = allQuizzes.filter((q) => {
      const d = dueStringToDate(q.when || q.dateStr, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    return { hw, quizzes };
  });

  const totalItems = dayItems.reduce((s, d) => s + d.hw.length + d.quizzes.length, 0);
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <>
      <PageHeader eyebrow={termInfo} title="Your" italic="schedule." meta={weekRange} actions={<>
        <button className="sn-btn ghost" onClick={() => setWeekOffset((w) => w - 1)}>← Week</button>
        <button className="sn-btn ghost" onClick={() => setWeekOffset((w) => w + 1)}>Week →</button>
        <button className="sn-btn" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} style={{ opacity: weekOffset === 0 ? 0.4 : 1 }}>Today</button>
      </>} />

      <AIStudyPlan />

      {/* ── Week at a glance stats ── */}
      {(() => {
        const parseEst = (est) => {
          if (!est) return 0;
          const h = est.match(/(\d+)h/); const m = est.match(/(\d+)m/);
          return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
        };
        const weekHW = dayItems.flatMap((d) => d.hw);
        const weekQuizzes = dayItems.flatMap((d) => d.quizzes);
        const urgentCount = weekHW.filter((h) => h.urgent).length;
        const totalMins = weekHW.reduce((s, h) => s + parseEst(h.est), 0);
        const timeStr = totalMins === 0 ? "—" : totalMins >= 60
          ? `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? ` ${totalMins % 60}m` : ""}`
          : `${totalMins}m`;
        const busiestIdx = dayItems.reduce((best, d, i) =>
          (d.hw.length + d.quizzes.length) > (dayItems[best].hw.length + dayItems[best].quizzes.length) ? i : best, 0);
        const dayNames2 = ["Mon","Tue","Wed","Thu","Fri"];
        const busiestCount = dayItems[busiestIdx].hw.length + dayItems[busiestIdx].quizzes.length;
        const stats = [
          { label: "Tasks due", value: weekHW.length || "—", accent: false },
          { label: "Quizzes", value: weekQuizzes.length || "—", accent: false },
          { label: "Est. workload", value: timeStr, accent: false },
          { label: "Urgent", value: urgentCount || "—", accent: urgentCount > 0 },
          { label: "Busiest day", value: busiestCount > 0 ? dayNames2[busiestIdx] : "—", accent: false },
        ];
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {stats.map((st) => (
              <div key={st.label} className="sn-card" style={{ flex: 1, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 22, fontStyle: "italic", color: st.accent ? "var(--accent)" : "var(--ink)" }}>
                  {st.value}
                </div>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Week at a glance — dynamic homework + quiz deadlines */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 32 }}>
        {colDates.map((colDate, i) => {
          const isToday = i === todayDayIndex;
          const isPast = !isToday && colDate < now && isCurrentWeek;
          const { hw, quizzes } = dayItems[i];
          const hasItems = hw.length > 0 || quizzes.length > 0;
          return (
            <div key={i} className="sn-card" style={{
              padding: "14px 16px",
              borderTop: `3px solid ${isToday ? "var(--accent)" : "var(--hairline)"}`,
              opacity: isPast ? 0.55 : 1,
              minHeight: 120,
            }}>
              {/* Day header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>
                  {dayNames[i]} <span style={{ fontSize: 14, color: "var(--ink-3)" }}>{colDate.getDate()}</span>
                </div>
                {isToday && <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>today</span>}
                {!isToday && isCurrentWeek && colDate > now && hw.length + quizzes.length > 0 && (
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {Math.round((colDate - now) / 86400000)}d away
                  </span>
                )}
              </div>

              {/* Items */}
              {!hasItems && (
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 12.5 }}>
                  Nothing due
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {hw.map((h) => {
                  const s = subjectBy(h.subject);
                  return (
                    <div key={h.id} onClick={() => window.location.hash = "#/homework/" + h.id}
                      style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 4 }}></span>
                      <div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.3, fontWeight: 500 }}>{h.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>{s.short}{h.urgent ? " · urgent" : ""}</div>
                      </div>
                    </div>
                  );
                })}
                {quizzes.map((q) => {
                  const s = subjectBy(q.subject);
                  return (
                    <div key={q.id} onClick={() => window.location.hash = "#/quiz-detail/" + q.id}
                      style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 4, outline: "1px dashed " + s.color, outlineOffset: 2 }}></span>
                      <div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.3, fontWeight: 500 }}>{q.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", marginTop: 1 }}>{s.short} · quiz</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems === 0 && (
        <div style={{ textAlign: "center", padding: "16px 0 32px", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 16 }}>
          Nothing due this week — add homework or quizzes and they'll appear here.
        </div>
      )}

      {/* ── Pomodoro Focus Timer ── */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
          Focus timer
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginBottom: 4 }}>
          25-minute Pomodoro to stay on track
        </div>
      </div>
      <PomodoroTimer />
    </>
  );
}


// ─────────────── Schedule view (full week)

function ScheduleContent() {
  const store = useNbStore();
  const [weekOffset, setWeekOffset] = React.useState(0);

  const now = new Date();
  const isCurrentWeek = weekOffset === 0;

  const viewMonday = new Date(now);
  viewMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  viewMonday.setHours(0, 0, 0, 0);

  const colDates = [0, 1, 2, 3, 4].map((off) => {
    const d = new Date(viewMonday);
    d.setDate(viewMonday.getDate() + off);
    return d;
  });

  const todayDayIndex = isCurrentWeek ? ((now.getDay() + 6) % 7) : -1;
  const weekRange = colDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " – " + colDates[4].toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const termInfo = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const month = viewMonday.getMonth();
      const term = month >= 7 ? "Fall" : "Spring";
      const wk = p && p.yearStart ? Math.min(Math.ceil((viewMonday - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : "—";
      const weekLabel = weekOffset === 0 ? "this week" : weekOffset < 0 ? Math.abs(weekOffset) + " week" + (Math.abs(weekOffset) > 1 ? "s" : "") + " ago" : weekOffset + " week" + (weekOffset > 1 ? "s" : "") + " ahead";
      return term + " · week " + wk + " · " + weekLabel;
    } catch { return weekOffset === 0 ? "This week" : weekOffset < 0 ? "Previous week" : "Next week"; }
  })();

  const allHW = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);
  const allQuizzes = React.useMemo(() => [...QUIZZES_UPCOMING, ...nbGetQuizzes()], [store.homework]);

  const parseEst = (est) => {
    if (!est) return 0;
    const h = est.match(/(\d+)h/); const m = est.match(/(\d+)m/);
    return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
  };

  const dayItems = colDates.map((colDate) => {
    const hw = allHW.filter((h) => {
      if (h.done) return false;
      const d = dueStringToDate(h.due, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    const quizzes = allQuizzes.filter((q) => {
      const d = dueStringToDate(q.when || q.dateStr, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    const loadMins = hw.reduce((s, h) => s + parseEst(h.est), 0) + quizzes.length * 45;
    const urgentCount = hw.filter(h => h.urgent).length;
    return { hw, quizzes, loadMins, urgentCount };
  });

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const totalItems = dayItems.reduce((s, d) => s + d.hw.length + d.quizzes.length, 0);
  const maxLoad = Math.max(...dayItems.map(d => d.loadMins), 1);
  const weekHW = dayItems.flatMap(d => d.hw);
  const weekQuizzes = dayItems.flatMap(d => d.quizzes);
  const urgentCount = weekHW.filter(h => h.urgent).length;
  const totalMins = weekHW.reduce((s, h) => s + parseEst(h.est), 0);
  const timeStr = totalMins === 0 ? "—" : totalMins >= 60
    ? Math.floor(totalMins / 60) + "h" + (totalMins % 60 > 0 ? " " + (totalMins % 60) + "m" : "") : totalMins + "m";
  const busiestIdx = dayItems.reduce((best, d, i) => d.loadMins > dayItems[best].loadMins ? i : best, 0);

  const heatColor = (loadMins, maxLoad) => {
    if (loadMins === 0) return "var(--hairline)";
    const r = loadMins / maxLoad;
    if (r >= 0.75) return "var(--accent)";
    if (r >= 0.45) return "var(--ochre)";
    if (r >= 0.2)  return "var(--info)";
    return "var(--done)";
  };

  const urgencyColor = (h) => {
    if (h.urgent) return "var(--accent)";
    const est = parseEst(h.est);
    if (est >= 90) return "var(--ochre)";
    return "var(--done)";
  };

  const emptyDayCopy = [
    "Free block — ideal for review",
    "Use this time for flashcard practice",
    "Great day to get ahead on readings",
    "Low pressure — perfect for deep work",
    "Catch up or preview next week",
  ];

  return (
    <>
      <PageHeader eyebrow={termInfo} title="Your" italic="schedule." meta={weekRange} actions={<>
        <button className="sn-btn ghost" onClick={() => setWeekOffset((w) => w - 1)}>← Week</button>
        <button className="sn-btn ghost" onClick={() => setWeekOffset((w) => w + 1)}>Week →</button>
        <button className="sn-btn" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} style={{ opacity: weekOffset === 0 ? 0.4 : 1 }}>Today</button>
      </>} />

      {/* ── AI Study Plan — primary hero ── */}
      <AIStudyPlan />

      {/* ── Workload heatmap ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)",
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="0" y="4" width="2.5" height="7" rx="1" fill="var(--done)" opacity="0.75"/>
            <rect x="3" y="2" width="2.5" height="9" rx="1" fill="var(--ochre)" opacity="0.75"/>
            <rect x="6" y="5.5" width="2.5" height="5.5" rx="1" fill="var(--accent)" opacity="0.75"/>
            <rect x="8.5" y="1" width="2.5" height="10" rx="1" fill="var(--accent)" opacity="0.5"/>
          </svg>
          Workload heatmap
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {[["Low","var(--done)"],["Med","var(--ochre)"],["High","var(--accent)"]].map(([label,color]) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: color, opacity: 0.75, display: "inline-block" }}/>
                <span style={{ fontSize: 9, color: "var(--ink-3)" }}>{label}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {dayItems.map((d, i) => {
            const pct = maxLoad > 0 ? d.loadMins / maxLoad : 0;
            const color = heatColor(d.loadMins, maxLoad);
            const isBusiest = i === busiestIdx && d.loadMins > 0;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: 36, background: "var(--bg-2)", borderRadius: 5, overflow: "hidden", position: "relative", border: "1px solid var(--hairline)" }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: Math.max(pct * 100, d.loadMins > 0 ? 10 : 0) + "%",
                    background: color, opacity: 0.72,
                    transition: "height 0.4s ease",
                    borderRadius: "4px 4px 0 0",
                  }} />
                  {isBusiest && (
                    <div style={{
                      position: "absolute", top: 3, right: 5,
                      fontFamily: "var(--f-mono)", fontSize: 7, color: color,
                      textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
                    }}>peak</div>
                  )}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)",
                }}>
                  <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{dayNames[i]}</span>
                  <span>{d.loadMins > 0 ? (d.loadMins >= 60 ? Math.floor(d.loadMins/60) + "h" + (d.loadMins%60>0?(d.loadMins%60)+"m":"") : d.loadMins+"m") : "·"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Summary stats — connected to calendar ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Tasks due", value: weekHW.length || "—", warn: false },
          { label: "Quizzes", value: weekQuizzes.length || "—", warn: false },
          { label: "Est. study time", value: timeStr, warn: false },
          { label: "Urgent", value: urgentCount || "—", warn: urgentCount > 0 },
          { label: "Busiest day", value: dayItems[busiestIdx].loadMins > 0 ? dayNames[busiestIdx] : "—", warn: false },
        ].map((st) => (
          <div key={st.label} style={{
            flex: 1, padding: "10px 12px",
            background: "var(--surface)", border: "1px solid var(--hairline)",
            borderRadius: 8,
            borderTop: "2px solid " + (st.warn ? "var(--accent)" : "var(--hairline)"),
          }}>
            <div style={{
              fontFamily: "var(--f-display)", fontSize: 20, fontStyle: "italic",
              color: st.warn ? "var(--accent)" : "var(--ink)", lineHeight: 1.1,
            }}>{st.value}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
              {st.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Day cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {colDates.map((colDate, i) => {
          const isToday = i === todayDayIndex;
          const isPast = !isToday && colDate < now && isCurrentWeek;
          const { hw, quizzes, loadMins, urgentCount: dayUrgent } = dayItems[i];
          const hasItems = hw.length > 0 || quizzes.length > 0;
          const daysAway = Math.round((colDate - now) / 86400000);
          const sortedHW = [...hw].sort((a, b) => {
            if (a.urgent && !b.urgent) return -1;
            if (!a.urgent && b.urgent) return 1;
            return parseEst(b.est) - parseEst(a.est);
          });

          return (
            <div key={i} style={{
              background: "var(--surface)",
              border: "1px solid " + (isToday ? "var(--accent)" : "var(--hairline)"),
              borderRadius: 10,
              overflow: "hidden",
              opacity: isPast ? 0.48 : 1,
              display: "flex", flexDirection: "column",
              minHeight: 150,
              transition: "opacity 0.2s",
            }}>
              {/* Day header */}
              <div style={{
                padding: "10px 13px 9px",
                borderBottom: "1px solid var(--hairline)",
                background: isToday ? "var(--accent-soft)" : "transparent",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              }}>
                <div>
                  <div style={{
                    fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1,
                    color: isToday ? "var(--accent)" : "var(--ink)",
                  }}>
                    {dayNames[i]}&nbsp;<span style={{ fontSize: 13, color: isToday ? "var(--accent)" : "var(--ink-3)" }}>{colDate.getDate()}</span>
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, marginTop: 3, color: isToday ? "var(--accent)" : "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                    {isToday ? "today" : daysAway === 1 ? "tomorrow" : daysAway > 0 && daysAway <= 4 ? daysAway + "d away" : colDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {hasItems && (
                    <div style={{
                      fontFamily: "var(--f-mono)", fontSize: 9, padding: "2px 6px",
                      borderRadius: 4, background: "var(--bg-2)",
                      color: dayUrgent > 0 ? "var(--accent)" : "var(--ink-3)",
                      border: "1px solid " + (dayUrgent > 0 ? "var(--accent)" : "var(--hairline)"),
                    }}>{hw.length + quizzes.length} item{hw.length + quizzes.length !== 1 ? "s" : ""}</div>
                  )}
                  {dayUrgent > 0 && (
                    <div style={{
                      fontFamily: "var(--f-mono)", fontSize: 8, padding: "1px 5px",
                      borderRadius: 3, background: "rgba(224,112,96,0.12)",
                      color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>⚡ urgent</div>
                  )}
                </div>
              </div>

              {/* Workload bar */}
              {hasItems && (
                <div style={{ height: 2, background: "var(--hairline)" }}>
                  <div style={{
                    height: "100%",
                    width: Math.max((loadMins / maxLoad) * 100, 12) + "%",
                    background: heatColor(loadMins, maxLoad),
                    opacity: 0.75,
                  }} />
                </div>
              )}

              {/* Items */}
              <div style={{ padding: "10px 13px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {!hasItems && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, paddingTop: 4 }}>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--done)", fontSize: 12.5 }}>
                      {isPast ? "Done" : "Clear day ✓"}
                    </div>
                    {!isPast && (
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", lineHeight: 1.45, opacity: 0.8 }}>
                        {emptyDayCopy[i % emptyDayCopy.length]}
                      </div>
                    )}
                  </div>
                )}
                {sortedHW.map((h) => {
                  const s = subjectBy(h.subject);
                  const uc = urgencyColor(h);
                  const est = parseEst(h.est);
                  return (
                    <div key={h.id}
                      onClick={() => window.location.hash = "#/homework/" + h.id}
                      style={{
                        display: "flex", flexDirection: "column", gap: 4,
                        cursor: "pointer", padding: "5px 8px",
                        background: "var(--bg-2)", borderRadius: 6,
                        borderLeft: "2px solid " + uc,
                      }}>
                      <div style={{ fontSize: 12, lineHeight: 1.3, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ width: 5, height: 5, borderRadius: 1.5, background: s.color, flexShrink: 0 }}/>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>{s.short}</span>
                        {h.est && (
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", background: "var(--bg)", padding: "0 4px", borderRadius: 3 }}>{h.est}</span>
                        )}
                        {h.urgent && (
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>urgent</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {quizzes.map((q) => {
                  const s = subjectBy(q.subject);
                  return (
                    <div key={q.id}
                      onClick={() => window.location.hash = "#/quiz-detail/" + q.id}
                      style={{
                        display: "flex", flexDirection: "column", gap: 4,
                        cursor: "pointer", padding: "5px 8px",
                        background: "var(--bg-2)", borderRadius: 6,
                        borderLeft: "2px solid var(--plum)",
                      }}>
                      <div style={{ fontSize: 12, lineHeight: 1.3, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ width: 5, height: 5, borderRadius: 1.5, background: s.color, flexShrink: 0 }}/>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>{s.short}</span>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--plum)", background: "var(--bg)", padding: "0 4px", borderRadius: 3 }}>quiz</span>
                        {q.confidence != null && (
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)" }}>{Math.round(q.confidence * 100)}% conf</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems === 0 && (
        <div style={{
          textAlign: "center", padding: "22px 0 32px",
          background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 10, marginBottom: 24,
        }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 16, marginBottom: 6 }}>
            Nothing due this week.
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>
            Add homework or quizzes and they'll appear here.
          </div>
        </div>
      )}

      {/* ── Focus timer ── */}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
        Focus timer
      </div>
      <PomodoroTimer />
    </>
  );
}


// ─────────────── Grades view

function GradesContent() {
  useNbStore();
  const [expanded, setExpanded] = React.useState(null);
  const [addingFor, setAddingFor] = React.useState(null);
  const [form, setForm] = React.useState({ title: "", score: "", total: "100", type: "quiz" });

  const grades = nbGetPref("grades", {});
  const entriesFor = (sid) => grades[sid] || [];

  const addEntry = (sid) => {
    const score = parseFloat(form.score);
    const total = parseFloat(form.total);
    if (!form.title.trim() || isNaN(score) || isNaN(total) || total <= 0) return;
    const entry = {
      id: Date.now().toString(36), title: form.title.trim(), score, total, type: form.type,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
    nbSetPref("grades", { ...grades, [sid]: [...entriesFor(sid), entry] });
    setForm({ title: "", score: "", total: "100", type: "quiz" });
    setAddingFor(null);
  };

  const deleteEntry = (sid, id) => {
    nbSetPref("grades", { ...grades, [sid]: entriesFor(sid).filter((e) => e.id !== id) });
  };

  const avgFor = (sid) => {
    const es = entriesFor(sid);
    if (!es.length) return null;
    const pts = es.reduce((s, e) => s + e.score, 0);
    const max = es.reduce((s, e) => s + e.total, 0);
    return max > 0 ? pts / max : null;
  };

  const toLetterGrade = (p) => {
    if (p >= 0.97) return "A+"; if (p >= 0.93) return "A"; if (p >= 0.90) return "A−";
    if (p >= 0.87) return "B+"; if (p >= 0.83) return "B"; if (p >= 0.80) return "B−";
    if (p >= 0.77) return "C+"; if (p >= 0.73) return "C"; if (p >= 0.70) return "C−";
    if (p >= 0.67) return "D+"; if (p >= 0.63) return "D"; if (p >= 0.60) return "D−";
    return "F";
  };
  const toGPA = (p) => {
    if (p >= 0.93) return 4.0; if (p >= 0.90) return 3.7;
    if (p >= 0.87) return 3.3; if (p >= 0.83) return 3.0; if (p >= 0.80) return 2.7;
    if (p >= 0.77) return 2.3; if (p >= 0.73) return 2.0; if (p >= 0.70) return 1.7;
    if (p >= 0.67) return 1.3; if (p >= 0.63) return 1.0; if (p >= 0.60) return 0.7;
    return 0.0;
  };
  const gradeInfo = (p) => {
    if (p >= 0.90) return { color: "var(--done)",  bg: "var(--done-soft)" };
    if (p >= 0.80) return { color: "var(--info)",  bg: "#dce8f0" };
    if (p >= 0.70) return { color: "var(--ochre)", bg: "#f5ecd6" };
    return               { color: "var(--accent)", bg: "var(--accent-soft)" };
  };
  const gpaToLetter = (g) => {
    if (g >= 3.85) return "A";  if (g >= 3.55) return "A−";
    if (g >= 3.15) return "B+"; if (g >= 2.85) return "B"; if (g >= 2.55) return "B−";
    if (g >= 2.15) return "C+"; if (g >= 1.85) return "C"; if (g >= 1.55) return "C−";
    if (g >= 1.15) return "D+"; if (g >= 0.85) return "D"; if (g >= 0.55) return "D−";
    return "F";
  };

  const subjectsWithAvg = SUBJECTS.map((s) => ({ ...s, avg: avgFor(s.id) }));
  const graded = subjectsWithAvg.filter((s) => s.avg !== null);
  const gpa = graded.length ? graded.reduce((s, sb) => s + toGPA(sb.avg), 0) / graded.length : null;
  const best  = graded.length     ? graded.reduce((a, b) => (a.avg >= b.avg ? a : b)) : null;
  const worst = graded.length > 1 ? graded.reduce((a, b) => (a.avg <= b.avg ? a : b)) : null;

  const termEyebrow = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const now = new Date();
      const term = now.getMonth() >= 7 ? "Fall term" : "Spring term";
      const wk = p && p.yearStart ? Math.min(Math.ceil((now - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : null;
      return wk && wk > 0 ? `${term} · Week ${wk} of 36` : term;
    } catch { return "This term"; }
  })();

  // Arc gauge (270° sweep)
  const arcR = 70;
  const arcC = 2 * Math.PI * arcR;
  const arcSweep = arcC * 0.75;
  const gpaFrac = gpa !== null ? gpa / 4.0 : 0;
  const gpaColor = gpa === null ? "var(--hairline)"
    : gpa >= 3.5 ? "var(--done)"
    : gpa >= 3.0 ? "var(--info)"
    : gpa >= 2.0 ? "var(--ochre)"
    : "var(--accent)";

  const inp = {
    padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: 4,
    fontFamily: "inherit", fontSize: 13, background: "var(--surface)", color: "var(--ink)", outline: "none",
  };

  const exportCSV = () => {
    if (!graded.length) { window.dispatchEvent(new CustomEvent("toast", { detail: "No grades to export yet" })); return; }
    const rows = [["Subject","Assignment","Type","Score","Total","Pct"]];
    SUBJECTS.forEach((s) => entriesFor(s.id).forEach((e) =>
      rows.push([s.name, e.title, e.type, e.score, e.total, Math.round(e.score / e.total * 100) + "%"])
    ));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "grades.csv"; a.click();
  };

  return (
    <>
      <PageHeader
        eyebrow={termEyebrow}
        title="Grades, "
        italic="this term."
        meta={gpa !== null
          ? `GPA ${gpa.toFixed(2)} unweighted · ${graded.length} subject${graded.length !== 1 ? "s" : ""} tracked`
          : SUBJECTS.length > 0 ? "Log your first score below to start tracking." : "Add subjects first, then log scores here."}
        actions={<button className="sn-btn ghost" onClick={exportCSV}>Export CSV</button>}
      />

      {/* ── Hero: three-panel card with arc GPA ── */}
      <div className="sn-card" style={{
        display: "grid",
        gridTemplateColumns: "auto 1px 1fr 1px 1fr",
        gap: 0, padding: 0, marginBottom: 28, overflow: "hidden",
      }}>

        {/* Panel 1 — Arc GPA gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 44px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 14 }}>GPA so far</div>
          <div style={{ position: "relative", width: 168, height: 168 }}>
            <svg width="168" height="168" style={{ transform: "rotate(135deg)" }}>
              <circle cx="84" cy="84" r={arcR} fill="none" stroke="var(--hairline)" strokeWidth="10"
                strokeDasharray={`${arcSweep} ${arcC - arcSweep}`} strokeLinecap="round" />
              <circle cx="84" cy="84" r={arcR} fill="none" stroke={gpaColor} strokeWidth="10"
                strokeDasharray={`${arcSweep * gpaFrac} ${arcC - arcSweep * gpaFrac}`}
                strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {gpa !== null ? (
                <>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.03em", color: gpaColor }}>{gpa.toFixed(2)}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 5 }}>/ 4.00</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 48, lineHeight: 1, color: "var(--hairline)" }}>—</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 5, opacity: 0.5 }}>/ 4.00</div>
                </>
              )}
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            {gpa !== null && (
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 24, color: gpaColor, lineHeight: 1 }}>{gpaToLetter(gpa)}</span>
            )}
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>
              {graded.length > 0 ? `${graded.length} subject${graded.length !== 1 ? "s" : ""} · unweighted` : "unweighted"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: "var(--hairline)", margin: "24px 0" }} />

        {/* Panel 2 — Best / Worst */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "32px 36px" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 8 }}>Best class</div>
            {best ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 1, background: best.color, flexShrink: 0, display: "inline-block" }}></span>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: 19, lineHeight: 1.1 }}>{best.name}</span>
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--done)", marginTop: 5 }}>{Math.round(best.avg * 100)}% · {toLetterGrade(best.avg)}</div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14 }}>No grades logged yet</div>
            )}
          </div>

          <div style={{ height: 1, background: "var(--hairline)" }} />

          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 8 }}>Needs attention</div>
            {worst ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 1, background: worst.color, flexShrink: 0, display: "inline-block" }}></span>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: 19, lineHeight: 1.1 }}>{worst.name}</span>
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: worst.avg < 0.70 ? "var(--accent)" : "var(--ochre)", marginTop: 5 }}>{Math.round(worst.avg * 100)}% · {toLetterGrade(worst.avg)}</div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14 }}>
                {best ? "Only one subject graded" : "Log scores below"}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: "var(--hairline)", margin: "24px 0" }} />

        {/* Panel 3 — All-subject bars */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 32px", gap: 11 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 2 }}>All subjects</div>
          {SUBJECTS.length === 0 && (
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 13 }}>No subjects yet</div>
          )}
          {SUBJECTS.map((s) => {
            const avg = avgFor(s.id);
            const pct = avg !== null ? avg * 100 : null;
            const gi  = avg !== null ? gradeInfo(avg) : null;
            return (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "6px 1fr 36px 26px", gap: 10, alignItems: "center" }}>
                <div style={{ width: 5, height: 5, borderRadius: 1, background: s.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, lineHeight: 1 }}>{s.name}</div>
                  <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: pct !== null ? `${pct}%` : "0%", background: gi ? gi.color : "var(--hairline)", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
                  </div>
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: gi ? gi.color : "var(--ink-3)", textAlign: "right" }}>
                  {pct !== null ? Math.round(pct) + "%" : "—"}
                </div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: gi ? gi.color : "var(--ink-3)", textAlign: "right" }}>
                  {avg !== null ? toLetterGrade(avg) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Subject list ── */}
      {SUBJECTS.length > 0 ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
              {SUBJECTS.length} subject{SUBJECTS.length !== 1 ? "s" : ""} · click to expand · + to log a score
            </div>
            <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--hairline)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {SUBJECTS.map((s, si) => {
              const entries  = entriesFor(s.id);
              const avg      = avgFor(s.id);
              const isOpen   = expanded === s.id;
              const isAdding = addingFor === s.id;
              const gi  = avg !== null ? gradeInfo(avg) : null;
              const pct = avg !== null ? avg * 100 : null;
              const byType = {};
              entries.forEach((e) => { byType[e.type] = (byType[e.type] || 0) + 1; });
              const typeStr = Object.entries(byType).map(([t, n]) => `${n} ${t}`).join(" · ");

              return (
                <div key={s.id} style={{ borderBottom: si < SUBJECTS.length - 1 ? "1px solid var(--hairline)" : "none" }}>

                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "5px 1fr 180px 56px 52px 40px",
                      alignItems: "center", gap: 16,
                      padding: "15px 16px",
                      cursor: "pointer",
                      background: isOpen ? "var(--bg-2)" : "var(--surface)",
                      transition: "background 0.12s",
                    }}
                  >
                    <div style={{ width: 5, height: 28, borderRadius: 2, background: s.color, flexShrink: 0 }} />

                    <div>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 16 }}>{s.name}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                        {entries.length > 0
                          ? (typeStr || `${entries.length} score${entries.length !== 1 ? "s" : ""}`)
                          : "no scores yet"}
                      </div>
                    </div>

                    {/* Grade bar */}
                    <div style={{ height: 4, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: pct !== null ? `${pct}%` : "0%",
                        background: gi ? gi.color : "transparent",
                        transition: "width 0.55s ease",
                      }} />
                    </div>

                    {/* Pct */}
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: gi ? gi.color : "var(--ink-3)", textAlign: "right", opacity: pct === null ? 0.28 : 1 }}>
                      {pct !== null ? Math.round(pct) + "%" : "—"}
                    </div>

                    {/* Letter grade */}
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1, color: gi ? gi.color : "var(--ink-3)", textAlign: "right", opacity: avg === null ? 0.18 : 1 }}>
                      {avg !== null ? toLetterGrade(avg) : "—"}
                    </div>

                    {/* + button */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setAddingFor(s.id); setExpanded(s.id); setForm({ title: "", score: "", total: "100", type: "quiz" }); }}
                        style={{ width: 26, height: 26, borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--bg-2)", color: "var(--ink-3)", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}
                        title="Add score"
                      >+</button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ background: "var(--bg-2)", borderTop: "1px dashed var(--hairline)", padding: "14px 24px 18px" }}>
                      {entries.length === 0 && !isAdding && (
                        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 13.5 }}>
                          No scores yet — click <b style={{ fontStyle: "normal" }}>+</b> to add your first.
                        </div>
                      )}
                      {entries.length > 0 && (
                        <div style={{ marginBottom: isAdding ? 16 : 0 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px 64px 20px", gap: 10, fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: 6, borderBottom: "1px solid var(--hairline)", marginBottom: 2 }}>
                            <div>Assignment</div><div>Score</div><div>Pct</div><div>Type</div><div></div>
                          </div>
                          {entries.map((e) => {
                            const ep  = e.score / e.total;
                            const egi = gradeInfo(ep);
                            return (
                              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px 64px 20px", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px dashed var(--hairline)" }}>
                                <div style={{ fontSize: 13.5 }}>
                                  {e.title}
                                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginLeft: 8 }}>{e.date}</span>
                                </div>
                                <div style={{ fontFamily: "var(--f-mono)", fontSize: 12 }}>{e.score}/{e.total}</div>
                                <div>
                                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, background: egi.bg, color: egi.color, padding: "2px 7px", borderRadius: 3 }}>
                                    {Math.round(ep * 100)}%
                                  </span>
                                </div>
                                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase" }}>{e.type}</div>
                                <button onClick={() => deleteEntry(s.id, e.id)} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 15, padding: 0, opacity: 0.4, lineHeight: 1 }} title="Remove">×</button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {isAdding && (
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", paddingTop: entries.length ? 14 : 0, borderTop: entries.length ? "1px solid var(--rule)" : "none", marginTop: entries.length ? 6 : 0 }}>
                          <div>
                            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Assignment</div>
                            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 4 Quiz" style={{ ...inp, width: 196 }} autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") addEntry(s.id); if (e.key === "Escape") setAddingFor(null); }} />
                          </div>
                          <div>
                            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Score</div>
                            <input value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} placeholder="92" type="number" min="0" style={{ ...inp, width: 68 }} />
                          </div>
                          <div>
                            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Out of</div>
                            <input value={form.total} onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))} placeholder="100" type="number" min="1" style={{ ...inp, width: 68 }} />
                          </div>
                          <div>
                            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Type</div>
                            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inp}>
                              <option value="quiz">Quiz</option>
                              <option value="test">Test</option>
                              <option value="hw">Homework</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <button className="sn-btn primary" onClick={() => addEntry(s.id)} style={{ fontSize: 12.5 }}>Save</button>
                          <button className="sn-btn ghost" onClick={() => setAddingFor(null)} style={{ fontSize: 12.5 }}>Cancel</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="sn-card" style={{ padding: "52px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 8 }}>No subjects set up yet.</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>Add your subjects first, then track grades here.</div>
        </div>
      )}
    </>
  );
}

// ─────────────── Create deck modal (manual or AI)

function CreateDeckModal({ onClose }) {
  const [mode, setMode] = React.useState("manual"); // "manual" | "ai"
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(SUBJECTS[0]?.id || "");
  const [saved, setSaved] = React.useState(false);

  // Manual mode state
  const [rows, setRows] = React.useState([{ front: "", back: "" }, { front: "", back: "" }, { front: "", back: "" }]);
  const addRow = () => setRows((r) => [...r, { front: "", back: "" }]);
  const updateRow = (i, field, val) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  // AI mode state
  const [topic, setTopic] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");
  const [aiCards, setAiCards] = React.useState([]);

  const generateAI = async () => {
    if (!topic.trim()) return;
    setGenerating(true); setGenError(""); setAiCards([]);
    const prompt = `Generate 8–12 flashcard Q&A pairs for a high school student studying: "${topic.trim()}".

Format EXACTLY like this:
Q: [term or question]
A: [definition or answer]

Return only the pairs, nothing else.`;
    try {
      const text = await aiComplete(prompt);
      const cards = [];
      let front = null;
      for (const line of text.split("\n")) {
        const l = line.trim();
        if (/^Q:/i.test(l)) { front = l.slice(2).trim(); }
        else if (/^A:/i.test(l) && front) { cards.push({ front, back: l.slice(2).trim() }); front = null; }
      }
      if (!cards.length) throw new Error("No cards parsed");
      setAiCards(cards);
      if (!title.trim()) setTitle(topic.trim());
    } catch (e) {
      if (e.message === "no-key") setGenError("__no-key__");
      else setGenError("Couldn't generate cards. Try again or switch to manual.");
    } finally { setGenerating(false); }
  };

  const save = () => {
    const cards = mode === "manual"
      ? rows.filter(r => r.front.trim() || r.back.trim()).map((r, i) => ({ id: "c" + i, front: r.front.trim(), back: r.back.trim() }))
      : aiCards.map((c, i) => ({ id: "c" + i, ...c }));
    if (!cards.length || !title.trim()) return;
    nbAddCustomDeck({ title: title.trim(), subject, cards, source: mode });
    setSaved(true);
    setTimeout(() => {
      onClose();
      window.dispatchEvent(new CustomEvent("toast", { detail: `"${title.trim()}" — ${cards.length} cards created` }));
    }, 600);
  };

  const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "inherit", fontSize: 13.5, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box" };
  const canSave = title.trim() && (mode === "manual" ? rows.some(r => r.front.trim()) : aiCards.length > 0);

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>New flashcard deck</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>Create a <em style={{ color: "var(--accent)" }}>deck</em></div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[["manual", "✏ Manual"], ["ai", "✦ AI Generate"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              padding: "6px 14px", borderRadius: 4, border: "1px solid " + (mode === k ? "var(--ink)" : "var(--hairline)"),
              background: mode === k ? "var(--ink)" : "var(--surface)", color: mode === k ? "var(--bg)" : "var(--ink-2)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Deck created!</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 2 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Deck title</div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit 3 — Cell Division" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Subject</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SUBJECTS.map((s) => (
                  <button key={s.id} onClick={() => setSubject(s.id)} style={{
                    padding: "4px 8px", borderRadius: 3, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit",
                    border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                    background: subject === s.id ? "var(--ink)" : "var(--surface)",
                    color: subject === s.id ? "var(--bg)" : "var(--ink)",
                  }}><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: s.color, marginRight: 4, verticalAlign: "middle" }}></span>{s.short}</button>
                ))}
              </div>
            </div>
          </div>

          {mode === "manual" && (
            <>
              <div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Cards ({rows.filter(r => r.front.trim()).length} filled)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "4px 8px", marginBottom: 8 }}>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 2px" }}>Term / Front</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 2px" }}>Definition / Back</div>
                  <div></div>
                  {rows.map((row, i) => (
                    <React.Fragment key={i}>
                      <input value={row.front} onChange={(e) => updateRow(i, "front", e.target.value)} placeholder={`Term ${i + 1}`} style={inputStyle} />
                      <input value={row.back} onChange={(e) => updateRow(i, "back", e.target.value)} placeholder={`Definition ${i + 1}`} style={inputStyle} />
                      <button onClick={() => removeRow(i)} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 16, padding: 0 }} title="Remove">×</button>
                    </React.Fragment>
                  ))}
                </div>
                <button className="sn-btn ghost" onClick={addRow} style={{ fontSize: 12.5 }}>+ Add card</button>
              </div>
            </>
          )}

          {mode === "ai" && (
            <>
              <div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Topic or description</div>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                  placeholder="e.g. AP Biology — cellular respiration, ATP synthesis, and the electron transport chain"
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="sn-btn primary" onClick={generateAI} disabled={generating || !topic.trim()} style={{ opacity: generating || !topic.trim() ? 0.6 : 1 }}>
                  {generating ? "Generating…" : "✦ Generate cards"}
                </button>
                {aiCards.length > 0 && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--done)" }}>✓ {aiCards.length} cards ready</span>}
                {genError && genError !== "__no-key__" && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)" }}>{genError}</span>}
                {genError === "__no-key__" && <button className="sn-btn primary" style={{ fontSize: 11 }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>}
              </div>
              {aiCards.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Preview</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {aiCards.map((c, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "7px 0", borderBottom: "1px dashed var(--hairline)" }}>
                        <div style={{ fontSize: 13 }}>{c.front}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{c.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
            <button className="sn-btn primary" onClick={save} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.4 }}>
              Save deck {canSave ? `(${mode === "manual" ? rows.filter(r => r.front.trim()).length : aiCards.length} cards)` : ""}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────── Quizlet import modal

function QuizletImportModal({ onClose }) {
  const [raw, setRaw] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(SUBJECTS[0]?.id || "");
  const [sep, setSep] = React.useState("tab"); // tab | comma | dash
  const [preview, setPreview] = React.useState([]);
  const [saved, setSaved] = React.useState(false);

  const parse = (text, separator) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const sepChar = separator === "tab" ? "\t" : separator === "comma" ? "," : " — ";
    return lines.map((line) => {
      const idx = line.indexOf(sepChar);
      if (idx === -1) return null;
      return { front: line.slice(0, idx).trim(), back: line.slice(idx + sepChar.length).trim() };
    }).filter(Boolean);
  };

  React.useEffect(() => {
    setPreview(parse(raw, sep).slice(0, 5));
  }, [raw, sep]);

  const cards = parse(raw, sep);

  const save = () => {
    if (!cards.length || !title.trim()) return;
    nbAddCustomDeck({
      title: title.trim(),
      subject,
      cards: cards.map((c, i) => ({ id: "q" + i, q: c.front, a: c.back })),
      source: "quizlet",
    });
    setSaved(true);
    setTimeout(() => { onClose(); window.dispatchEvent(new CustomEvent("toast", { detail: `Imported "${title.trim()}" — ${cards.length} cards` })); }, 700);
  };

  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Import flashcards</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>
          From <em style={{ color: "var(--accent)" }}>Quizlet</em> or any set
        </div>
      </div>
      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Imported!</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 14px", background: "var(--bg-2)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            <b>How to export from Quizlet:</b> Open your set → ··· menu → <em>Export</em> → copy the text → paste below.
            <br/>Or type/paste any list with terms and definitions.
          </div>
          <Field label="Deck title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AP Bio Unit 4 — Cell Division"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "inherit", fontSize: 14, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }} />
          </Field>
          <Field label="Subject">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUBJECTS.map((s) => (
                <button key={s.id} onClick={() => setSubject(s.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                  background: subject === s.id ? "var(--ink)" : "var(--surface)",
                  color: subject === s.id ? "var(--bg)" : "var(--ink)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }}></span>{s.short}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Separator">
            <div style={{ display: "flex", gap: 6 }}>
              {[["tab","Tab (Quizlet default)"],["comma","Comma"],["dash","Dash (—)"]].map(([k, l]) => (
                <button key={k} onClick={() => setSep(k)} style={{
                  padding: "4px 10px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (sep === k ? "var(--ink)" : "var(--hairline)"),
                  background: sep === k ? "var(--ink)" : "var(--surface)", color: sep === k ? "var(--bg)" : "var(--ink)",
                }}>{l}</button>
              ))}
            </div>
          </Field>
          <Field label={`Paste your terms (${cards.length} cards detected)`}>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)}
              placeholder={"Term\tDefinition\nAnother term\tAnother definition\n…"}
              rows={7}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "var(--f-mono)", fontSize: 12, background: "var(--surface)", color: "var(--ink)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </Field>
          {preview.length > 0 && (
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Preview (first {preview.length})</div>
              {preview.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "6px 0", borderBottom: i < preview.length - 1 ? "1px dashed var(--hairline)" : "none" }}>
                  <div style={{ fontSize: 12.5 }}>{c.front}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{c.back}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
            <button className="sn-btn primary" onClick={save} disabled={!cards.length || !title.trim()} style={{ opacity: cards.length && title.trim() ? 1 : 0.4 }}>
              Import {cards.length ? cards.length + " cards" : ""}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────── Flashcards (uses FlashcardQuiz which already has a deck)

function FlashcardsContent({ onTakeQuiz }) {
  const [importOpen, setImportOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Listen for store changes (custom decks)
  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  // Only show built-in decks when using sample data (not when user has own subjects)
  const showBuiltinDecks = HOMEWORK.length > 0 || QUIZZES_UPCOMING.length > 0;

  const builtinDecks = showBuiltinDecks ? [
    { id: "bio-respiration", due: 6, last: "yesterday" },
    { id: "esp-u6",          due: 12, last: "today" },
    { id: "lit-beloved",     due: 0,  last: "3d ago" },
    { id: "alg2-trig",       due: 5,  last: "2d ago" },
    { id: "us-fed",          due: 3,  last: "Mon" },
    { id: "chem-periodic",   due: 8,  last: "today" },
  ].map((d) => ({ ...d, ...DECKS[d.id] })) : [];

  const customDecks = nbGetCustomDecks();
  const allDecks = [...builtinDecks, ...customDecks];
  const totalCards = allDecks.reduce((s, d) => s + (d.cards ? d.cards.length : 0), 0);
  const totalDue = builtinDecks.reduce((s, d) => s + (d.due || 0), 0);

  const eyebrowText = allDecks.length === 0
    ? "No decks yet · import or create one below"
    : `${allDecks.length} deck${allDecks.length !== 1 ? "s" : ""} · ${totalCards} cards total${totalDue > 0 ? ` · ${totalDue} due today` : ""}`;

  return (
    <>
      {importOpen && <QuizletImportModal onClose={() => { setImportOpen(false); forceUpdate(); }} />}
      {createOpen && <CreateDeckModal onClose={() => { setCreateOpen(false); forceUpdate(); }} />}
      <PageHeader eyebrow={eyebrowText} title="Flashcard" italic="decks." meta="Create manually, generate with AI, or import from Quizlet." actions={<>
        <button className="sn-btn ghost" onClick={() => setImportOpen(true)}>Import Quizlet</button>
        <button className="sn-btn primary" onClick={() => setCreateOpen(true)}>+ New deck</button>
      </>} />

      {allDecks.length === 0 && (
        <div className="sn-card" style={{ padding: "48px 32px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 10 }}>No flashcard decks yet.</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)", marginBottom: 20, lineHeight: 1.6 }}>
            Create cards manually, generate them with AI, or import from Quizlet.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="sn-btn primary" onClick={() => setCreateOpen(true)}>+ New deck</button>
            <button className="sn-btn ghost" onClick={() => setImportOpen(true)}>Import Quizlet</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {builtinDecks.map((d) => {
          const s = subjectBy(d.subject);
          return (
            <div key={d.id} className="sn-card" onClick={() => onTakeQuiz("flashcard", d.id)} style={{ cursor: "pointer", position: "relative", overflow: "hidden", paddingTop: 22 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.color }}></div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short}</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 21, lineHeight: 1.15, marginTop: 4 }}>{d.title}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>
                <span><b style={{ color: "var(--ink)" }}>{d.cards.length}</b> cards</span>
                <span style={{ color: d.due > 0 ? "var(--accent)" : "var(--ink-3)" }}><b>{d.due}</b> due</span>
                <span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>{d.last}</span>
              </div>
            </div>
          );
        })}
        {customDecks.map((d) => {
          const s = subjectBy(d.subject) || SUBJECTS[0] || { color: "var(--accent)", short: "??" };
          const sourceLabel = d.source === "ai" ? "AI generated" : d.source === "manual" ? "Manual" : "Quizlet import";
          return (
            <div key={d.id} className="sn-card" style={{ cursor: "pointer", position: "relative", overflow: "hidden", paddingTop: 22 }}
              onClick={() => onTakeQuiz("flashcard", d.id)}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.color }}></div>
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <button onClick={(e) => { e.stopPropagation(); nbDeleteCustomDeck(d.id); forceUpdate(); }} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 14 }} title="Remove deck">×</button>
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short}</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 21, lineHeight: 1.15, marginTop: 4 }}>{d.title}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>
                <span><b style={{ color: "var(--ink)" }}>{d.cards ? d.cards.length : 0}</b> cards</span>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 11, color: "var(--accent)" }}>{sourceLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────────── Notes index (all subjects' notes)

function NotesIndexContent({ onOpenSubject, onOpenNote }) {
  const [tagView, setTagView] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState(null);
  const store = useNbStore();

  // Collect all notes from all subjects (built-in + user)
  const allNotes = React.useMemo(() => {
    const out = [];
    SUBJECTS.forEach((s) => {
      const builtin = notesForSubject(s.id);
      const user = store.notesFor(s.id);
      [...user, ...builtin].forEach((n) => out.push({ ...n, subjectId: s.id }));
    });
    return out;
  }, [store]);

  // Build tag → notes map
  const tagMap = React.useMemo(() => {
    const map = {};
    allNotes.forEach((n) => {
      (n.tags || []).forEach((t) => {
        const tag = t.startsWith("#") ? t : "#" + t;
        if (!map[tag]) map[tag] = [];
        map[tag].push(n);
      });
    });
    return map;
  }, [allNotes]);

  const allTags = Object.keys(tagMap).sort();
  const filteredNotes = selectedTag ? (tagMap[selectedTag] || []) : allNotes;
  const totalNotes = allNotes.length;

  return (
    <>
      <PageHeader
        eyebrow={`${totalNotes} notes · ${SUBJECTS.length} subjects`}
        title="All your" italic="notes."
        meta="Filter by subject or tag · search any text"
        actions={<>
          <button className="sn-btn ghost" onClick={() => { setTagView((v) => !v); setSelectedTag(null); }}
            style={{ background: tagView ? "var(--ink)" : undefined, color: tagView ? "var(--bg)" : undefined }}>
            By tag
          </button>
          <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "note" } }))}>+ New note</button>
        </>}
      />

      {tagView ? (
        <>
          {/* Tag cloud */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={() => setSelectedTag(null)} style={{
              padding: "5px 12px", borderRadius: 20, border: "1px solid var(--hairline)", fontSize: 12.5,
              background: !selectedTag ? "var(--ink)" : "var(--surface)", color: !selectedTag ? "var(--bg)" : "var(--ink-2)",
              cursor: "pointer", fontFamily: "inherit",
            }}>All ({allNotes.length})</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} style={{
                padding: "5px 12px", borderRadius: 20, border: "1px solid var(--hairline)", fontSize: 12.5,
                background: selectedTag === tag ? "var(--accent)" : "var(--surface)",
                color: selectedTag === tag ? "white" : "var(--ink-2)",
                cursor: "pointer", fontFamily: "var(--f-mono)", letterSpacing: "0.04em",
              }}>{tag} <span style={{ opacity: 0.65, fontSize: 11 }}>{tagMap[tag].length}</span></button>
            ))}
            {allTags.length === 0 && (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14 }}>
                No tags yet — add tags when creating notes or edit notes to add #tags.
              </div>
            )}
          </div>

          {/* Notes filtered by tag */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredNotes.map((n) => {
              const sb = subjectBy(n.subjectId);
              return (
                <div key={n.subjectId + ":" + n.id} onClick={() => onOpenNote(n.subjectId, n.id)}
                  className="sn-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", cursor: "pointer" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: sb.color, flexShrink: 0 }}></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                      {sb.short} · {n.when}
                      {(n.tags || []).map((t) => <span key={t} style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 10, background: "var(--bg-2)", color: "var(--accent)", fontSize: 10 }}>{t.startsWith("#") ? t : "#" + t}</span>)}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>OPEN →</span>
                </div>
              );
            })}
            {filteredNotes.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>
                No notes with tag {selectedTag}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {SUBJECTS.filter((s) => s.notes > 0 || store.notesFor(s.id).length > 0).map((s) => {
            const subjectNotes = [...store.notesFor(s.id), ...notesForSubject(s.id)].slice(0, 3);
            return (
              <div key={s.id} className="sn-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                <div onClick={() => onOpenSubject(s.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", cursor: "pointer" }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{subjectNotes.length} NOTES →</div>
                </div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0 }}>
                  {subjectNotes.length === 0 && (
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink-3)", padding: "6px 0" }}>
                      No notes yet for {s.short}
                    </div>
                  )}
                  {subjectNotes.map((n) => (
                    <div key={n.id}
                      onClick={(e) => { e.stopPropagation(); onOpenNote(s.id, n.id); }}
                      style={{ fontSize: 12.5, color: "var(--ink)", display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--hairline)", cursor: "pointer" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                      <span style={{ color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 10, whiteSpace: "nowrap", marginLeft: 8 }}>{n.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

const SAMPLE_NOTES = {
  "spanish-3": [{ id: "es-pret", title: "Pretérito vs Imperfecto", when: "Mon" }, { id: "es-sub", title: "Subjuntivo intro", when: "last week" }],
  "chem": [{ id: "ch-mol", title: "Molarity & dilutions", when: "today" }, { id: "ch-trends", title: "Periodic trends", when: "Mon" }],
  "studio-art": [{ id: "art-char", title: "Charcoal still life — process", when: "today" }, { id: "art-comp", title: "Composition rules", when: "Apr 30" }],
  "phys-ed": [{ id: "pe-log", title: "May workout log", when: "yesterday" }],
};
function sampleNotesFor(subjectId) {
  return SAMPLE_NOTES[subjectId] || [{ id: "p", title: "Recent notes will appear here", when: "—" }];
}

// ─────────────── Quiz Detail Page — full notes/study tab per quiz

function QuizDetailPage({ quizId }) {
  useNbStore(); // subscribe to store so re-renders on quiz deletions
  const allQuizzes = [...QUIZZES_UPCOMING, ...nbGetQuizzes()];
  const quiz = allQuizzes.find((q) => q.id === quizId);

  const saved = nbGetNoteOverride("quiz-" + quizId) || {};
  const ceRef = React.useRef(null);
  const ceInitialized = React.useRef(false);

  // AI flashcard generation
  const existingDeck = React.useMemo(() => nbGetCustomDecks().find((d) => d.quizId === quizId), [quizId]);
  const [genDeckId, setGenDeckId] = React.useState(existingDeck ? existingDeck.id : null);
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");

  React.useEffect(() => {
    if (ceRef.current && !ceInitialized.current) {
      ceRef.current.innerHTML = saved.content || "";
      ceInitialized.current = true;
    }
  }, []);

  const generateFlashcards = async () => {
    const content = ceRef.current ? ceRef.current.textContent.trim() : (saved.content || "").replace(/<[^>]*>/g, " ").trim();
    if (!content) {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Add notes to your quiz tab first, then generate flashcards." }));
      return;
    }
    setGenerating(true);
    setGenError("");
    const prompt = `Generate 6–10 flashcard Q&A pairs from the following study notes.

Format EXACTLY like this (one pair per two lines, nothing else):
Q: [question or term]
A: [answer or definition]

Study notes:
${content.slice(0, 2000)}`;

    try {
      const text = await aiComplete(prompt);
      // Parse Q / A pairs
      const cards = [];
      let front = null;
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (/^Q:/i.test(trimmed)) { front = trimmed.slice(2).trim(); }
        else if (/^A:/i.test(trimmed) && front) {
          cards.push({ id: "c" + cards.length, front, back: trimmed.slice(2).trim() });
          front = null;
        }
      }
      if (!cards.length) throw new Error("No cards parsed");
      // Remove any old AI deck for this quiz then save fresh one
      const old = nbGetCustomDecks().find((d) => d.quizId === quizId);
      if (old) nbDeleteCustomDeck(old.id);
      const deck = nbAddCustomDeck({ title: quiz.title, subject: quiz.subject, cards, source: "ai", quizId });
      setGenDeckId(deck.id);
      window.dispatchEvent(new CustomEvent("toast", { detail: `Generated ${cards.length} flashcards from your quiz tab ✓` }));
    } catch (e) {
      if (e.message === "no-key") {
        setGenError("__no-key__");
      } else {
        setGenError("Couldn't generate flashcards. Try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!quiz) {
    return (
      <div style={{ padding: "60px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>Quiz not found.</div>
        <button className="sn-btn primary" onClick={() => window.location.hash = "#/quizzes"} style={{ marginTop: 18 }}>← Back to Quizzes</button>
      </div>
    );
  }

  const s = subjectBy(quiz.subject) || SUBJECTS[0] || { color: "var(--accent)", short: "??" };
  const isUserQuiz = nbGetQuizzes().some((q) => q.id === quizId);

  const deleteQuiz = () => {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    nbDeleteQuiz(quizId);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Quiz removed" }));
    window.location.hash = "#/quizzes";
  };

  return (
    <div style={{ padding: "32px 56px", maxWidth: 780, overflow: "auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => window.location.hash = "#/quizzes"}
          style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          ← Quizzes
        </button>
        <span style={{ color: "var(--hairline)" }}>/</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{s.short}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 8 }}>
        <div style={{ width: 5, borderRadius: 3, background: s.color, alignSelf: "stretch", minHeight: 40, flexShrink: 0 }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {s.short} · {quiz.when || quiz.dateStr || "Upcoming"}{quiz.length ? ` · ${quiz.length}` : ""}
            </span>
            {isUserQuiz && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--accent)", borderRadius: 3, padding: "1px 6px" }}>Your Quiz</span>
            )}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            {quiz.title}
          </div>
        </div>
      </div>

      {/* Confidence meter */}
      {quiz.confidence !== undefined && (
        <div style={{ marginTop: 12, marginBottom: 4, maxWidth: 280 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Confidence</div>
          <ConfidenceMeter value={quiz.confidence} />
        </div>
      )}

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, marginBottom: genError ? 8 : 28, marginTop: 18, flexWrap: "wrap" }}>
        {/* Primary: study the quiz-specific deck, or generate one */}
        {genDeckId ? (
          <button className="sn-btn primary" onClick={() => window.location.hash = "#/quiz/flashcard/" + genDeckId} style={{ fontSize: 12.5 }}>
            {Ico.cards} Practice flashcards →
          </button>
        ) : (
          <button className="sn-btn primary" onClick={generateFlashcards} disabled={generating} style={{ fontSize: 12.5, opacity: generating ? 0.7 : 1 }}>
            {generating ? "Generating…" : "✦ Generate &amp; practice"}
          </button>
        )}
        {genDeckId && (
          <button className="sn-btn ghost" onClick={generateFlashcards} disabled={generating} style={{ fontSize: 12.5 }}>
            {generating ? "Generating…" : "↻ Regenerate cards"}
          </button>
        )}
        <button className="sn-btn ghost" onClick={() => window.location.hash = "#/subject/" + quiz.subject + "/notes"} style={{ fontSize: 12.5 }}>
          Open {s.short} notes →
        </button>
        {isUserQuiz && (
          <button className="sn-btn ghost" onClick={deleteQuiz} style={{ fontSize: 12.5, color: "var(--accent)", marginLeft: "auto" }}>Delete</button>
        )}
      </div>
      {genError && genError !== "__no-key__" && <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)", marginBottom: 20 }}>{genError}</div>}
      {genError === "__no-key__" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 14px", background: "var(--bg-2)", borderRadius: 6, border: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Connect your API key to generate flashcards from your notes.</span>
          <button className="sn-btn primary" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
        </div>
      )}

      {/* Quiz tab content area */}
      <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
          Quiz tab — study notes &amp; content
        </div>
        <style>{`[contenteditable][data-placeholder]:empty::before { content: attr(data-placeholder); color: var(--ink-3); pointer-events: none; display: block; font-style: italic; }`}</style>
        <div
          ref={ceRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Add key concepts, formulas, vocab, practice problems — anything to study for this quiz…"
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            nbUpdateNoteContent("quiz-" + quizId, { content: html });
          }}
          style={{
            outline: "none", minHeight: 280, fontSize: 14.5, lineHeight: 1.7,
            color: "var(--ink)", fontFamily: "inherit", whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        />
      </div>
    </div>
  );
}



// ─────────────── Tools Dashboard — Elevated ──────────────────────────────────

// Inject CSS for micro-interactions and animations
function ToolsStyleBlock() {
  return (
    <style>{`
      @keyframes tl-fade-up {
        from { opacity: 0; transform: translateY(5px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes tl-pulse-ring {
        0%   { box-shadow: 0 0 0 0 var(--ring-color, rgba(112,192,122,0.5)); }
        70%  { box-shadow: 0 0 0 5px transparent; }
        100% { box-shadow: 0 0 0 0 transparent; }
      }
      @keyframes tl-dot-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.35; }
      }
      .tl-tool-row {
        transition: background 0.1s ease, border-left-color 0.12s ease;
        animation: tl-fade-up 0.16s ease both;
      }
      .tl-tool-row:hover { background: var(--highlight) !important; }
      .tl-sugg-card {
        transition: background 0.1s ease, transform 0.12s ease;
        animation: tl-fade-up 0.2s ease both;
      }
      .tl-sugg-card:hover { transform: translateX(2px); }
      .tl-act-row { transition: background 0.08s ease; }
      .tl-act-row:hover { background: var(--bg-2) !important; }
      .tl-palette-item { transition: background 0.06s ease; }
      .tl-stat-card { transition: border-color 0.12s ease, box-shadow 0.12s ease; }
      .tl-stat-card:hover { border-color: var(--rule) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
      .tl-live-dot { animation: tl-pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite; }
      .tl-blink     { animation: tl-dot-blink 1.6s ease infinite; }
      .tl-grid-card { transition: background 0.12s ease, border-color 0.12s ease, box-shadow 0.14s ease; }
      .tl-grid-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.18) !important; }
    `}</style>
  );
}

// 7-day sparkline bar chart
function Sparkline({ data, color, width = 52, height = 22 }) {
  const max = Math.max(...data, 1);
  const n = data.length;
  const gap = 2;
  const barW = Math.max(1, Math.floor((width - (n - 1) * gap) / n));
  return (
    <svg width={width} height={height} style={{ display: "block", flexShrink: 0 }}>
      {data.map((v, i) => {
        const h = v === 0 ? 2 : Math.max(3, Math.round((v / max) * height));
        const alpha = v === 0 ? 0.12 : 0.25 + (i / (n - 1)) * 0.75;
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx={1.5}
            fill={v === 0 ? "var(--hairline)" : color}
            opacity={v === 0 ? 1 : alpha}
          />
        );
      })}
    </svg>
  );
}

// Streak flame indicator
function StreakBadge({ count, color }) {
  if (!count || count < 2) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontFamily: "var(--f-mono)", fontSize: 9.5,
      color, background: color + "15",
      border: "1px solid " + color + "30",
      borderRadius: 3, padding: "1px 5px",
    }}>
      <svg width="8" height="9" viewBox="0 0 10 12" fill={color}>
        <path d="M5 0c.4 1-.2 1.8-.5 2.4-.4.8.2 1.2.5.8.2-.3.3-.7.5-1 .3.6 1.2 1.5 1.2 2.6 0 1.4-1.2 2.6-1.5 2.6-.4 0-.5-.6-1-.9-.7-.4-.9-1.3-.2-1.8-.3 1.2.6 1.5.9.9.4-.8-.6-1.2-.8-2.1C3.8 2.7 5 1.7 5 0z"/>
      </svg>
      {count}d
    </span>
  );
}

// Status dot with meaning
function StatusDot({ status, color }) {
  const cfg = {
    active:   { bg: "var(--done)",   label: "Active",   pulse: true  },
    trending: { bg: "var(--info)",   label: "Trending", pulse: false },
    new:      { bg: "var(--info)",   label: "New",      pulse: false },
    idle:     { bg: "var(--ink-3)",  label: "Idle",     pulse: false },
  }[status] || { bg: "var(--hairline)", label: "", pulse: false };

  return (
    <span
      className={cfg.pulse ? "tl-live-dot" : ""}
      style={{
        display: "inline-block", width: 6, height: 6, borderRadius: "50%",
        background: cfg.bg, flexShrink: 0,
        "--ring-color": cfg.pulse ? "rgba(112,192,122,0.45)" : "transparent",
      }}
      title={cfg.label}
    />
  );
}

// Enhanced tool data
const TOOLS_DATA = [
  {
    id: "claude",     name: "Claude",      category: "AI",
    desc: "Write, code, analyze, and reason — Anthropic's frontier AI.",
    url: "https://claude.ai",     color: "#d97757",
    shortcut: "C", tags: ["writing", "code", "reasoning"],
    stat: { sessions: 142, lastUsed: "2m ago", trend: "+12%", streak: 7, weekSessions: 38, prevWeek: 34 },
    sparkline: [8, 12, 6, 15, 11, 18, 22],
    status: "active",
  },
  {
    id: "notion",     name: "Notion",      category: "Productivity",
    desc: "All-in-one workspace for notes, wikis, and project management.",
    url: "https://notion.so",     color: "#a0a0a0",
    shortcut: "O", tags: ["notes", "wiki", "tasks"],
    stat: { sessions: 201, lastUsed: "4h ago", trend: "+3%", streak: 12, weekSessions: 42, prevWeek: 40 },
    sparkline: [18, 14, 20, 16, 22, 18, 24],
    status: "trending",
  },
  {
    id: "figma",      name: "Figma",       category: "Design",
    desc: "Design and prototype interfaces collaboratively in real time.",
    url: "https://figma.com",     color: "#7c5cfc",
    shortcut: "F", tags: ["design", "prototype", "ui"],
    stat: { sessions: 89, lastUsed: "1h ago", trend: "+5%", streak: 4, weekSessions: 22, prevWeek: 21 },
    sparkline: [10, 8, 14, 12, 9, 16, 14],
    status: "active",
  },
  {
    id: "notebooklm", name: "NotebookLM",  category: "AI",
    desc: "Upload your notes and lecture slides — ask AI anything about them.",
    url: "https://notebooklm.google.com", color: "#4285f4",
    shortcut: "N", tags: ["notes", "research", "study"],
    stat: { sessions: 67, lastUsed: "3h ago", trend: "+8%", streak: 3, weekSessions: 18, prevWeek: 14 },
    sparkline: [4, 6, 8, 5, 10, 12, 14],
    status: "trending",
  },
  {
    id: "zapier",     name: "Zapier",      category: "Productivity",
    desc: "Automate repetitive tasks by connecting your apps and workflows.",
    url: "https://zapier.com",    color: "#ff4f00",
    shortcut: "Z", tags: ["automation", "workflow", "apps"],
    stat: { sessions: 45, lastUsed: "1d ago", trend: "+18%", streak: 2, weekSessions: 12, prevWeek: 8 },
    sparkline: [3, 5, 4, 7, 8, 6, 10],
    status: "trending",
  },
  {
    id: "canva",      name: "Canva",       category: "Design",
    desc: "Create posters, presentations, and graphics with drag-and-drop.",
    url: "https://canva.com",     color: "#00c4cc",
    shortcut: "V", tags: ["graphics", "poster", "slides"],
    stat: { sessions: 34, lastUsed: "Yesterday", trend: "-2%", streak: 0, weekSessions: 6, prevWeek: 8 },
    sparkline: [6, 4, 8, 3, 2, 4, 3],
    status: "idle",
  },
  {
    id: "gemini",     name: "Gemini",      category: "AI",
    desc: "Google's multimodal AI for research, writing, and complex tasks.",
    url: "https://gemini.google.com", color: "#4f8ef7",
    shortcut: "G", tags: ["research", "writing", "multimodal"],
    stat: { sessions: 28, lastUsed: "2d ago", trend: "new", streak: 0, weekSessions: 8, prevWeek: 0 },
    sparkline: [0, 0, 2, 4, 3, 6, 8],
    status: "new",
  },
  {
    id: "webflow",    name: "Webflow",     category: "Design",
    desc: "Build production-ready websites visually — no code required.",
    url: "https://webflow.com",   color: "#4353ff",
    shortcut: "W", tags: ["website", "cms", "no-code"],
    stat: { sessions: 12, lastUsed: "3d ago", trend: "new", streak: 0, weekSessions: 3, prevWeek: 0 },
    sparkline: [0, 2, 1, 3, 2, 1, 4],
    status: "new",
  },
];

const QUICK_ACTIONS = [
  { label: "Ask Claude a question", shortcut: "⌘1", tool: "claude",     desc: "Start a new conversation" },
  { label: "New Figma file",        shortcut: "⌘2", tool: "figma",      desc: "Open design canvas" },
  { label: "Open NotebookLM",       shortcut: "⌘3", tool: "notebooklm", desc: "Study from your notes" },
  { label: "New Notion page",       shortcut: "⌘4", tool: "notion",     desc: "Capture or organize" },
];

const ACTIVITY_LOG = [
  { tool: "claude",     action: "Essay draft — AP English",        time: "2m ago",    group: "now" },
  { tool: "figma",      action: "Opened design project",           time: "1h ago",    group: "today" },
  { tool: "notion",     action: "Updated Physics notes",           time: "4h ago",    group: "today" },
  { tool: "notebooklm", action: "Uploaded AP Bio lecture PDF",     time: "3h ago",    group: "today" },
  { tool: "zapier",     action: "Homework reminder automation",    time: "Yesterday", group: "yesterday" },
  { tool: "canva",      action: "Class poster — Biology",          time: "Yesterday", group: "yesterday" },
];

const AI_SUGGESTIONS = [
  {
    tool: "notebooklm",
    reason: "Upload lecture notes before the quiz",
    context: "Bio quiz in 2 days · confidence at 62%",
    priority: "high",
    actionLabel: "Open →",
  },
  {
    tool: "claude",
    reason: "3 homework items still need writing",
    context: "Essay · Physics problem set · History reading",
    priority: "medium",
    actionLabel: "Start →",
  },
  {
    tool: "zapier",
    reason: "Automate your deadline reminders",
    context: "Save ~30 min/week · 2 flows suggested",
    priority: "low",
    actionLabel: "Explore →",
  },
];

function ToolIconSm({ id, color, size = 18 }) {
  const p = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round" };
  const s = size;
  switch (id) {
    case "figma": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <rect x="5" y="3" width="7" height="7" rx="3.5"/>
        <rect x="12" y="3" width="7" height="7" rx="3.5"/>
        <rect x="5" y="10" width="7" height="7" rx="3.5"/>
        <circle cx="15.5" cy="13.5" r="3.5"/>
        <rect x="5" y="17" width="7" height="4" rx="2"/>
      </svg>
    );
    case "notebooklm": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <rect x="4" y="3" width="13" height="16" rx="1.5"/>
        <path d="M4 7h13M7 3v4"/>
        <path d="M8.5 12.5l1.5 1.5 2.5-3" strokeWidth="1.8"/>
      </svg>
    );
    case "notion": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <rect x="4" y="3" width="16" height="18" rx="2" fill={color + "18"}/>
        <path d="M8 7v10M8 7l8 10M8 7h5" strokeWidth="2"/>
      </svg>
    );
    case "canva": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 15c1.2 1.8 3.6 2.3 5.3 1.2 1.7-1.1 2.5-3.5 1.6-5.7C15 8.3 12.5 7 10.2 8S7.3 11.8 8.5 14" strokeWidth="2"/>
      </svg>
    );
    case "claude": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <circle cx="12" cy="12" r="4" fill={color + "25"}/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="5.6" y1="5.6" x2="8.5" y2="8.5"/>
        <line x1="15.5" y1="15.5" x2="18.4" y2="18.4"/>
        <line x1="5.6" y1="18.4" x2="8.5" y2="15.5"/>
        <line x1="15.5" y1="8.5" x2="18.4" y2="5.6"/>
      </svg>
    );
    case "gemini": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <path d="M12 2 C12 7.5 16.5 12 22 12 C16.5 12 12 16.5 12 22 C12 16.5 7.5 12 2 12 C7.5 12 12 7.5 12 2 Z" fill={color + "25"} stroke={color} strokeWidth="1.4"/>
      </svg>
    );
    case "webflow": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="2">
        <path d="M2 9l5 9 3-5.5 2.5 4L16 7l4.5 8.5"/>
      </svg>
    );
    case "zapier": return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" fill={color + "18"}/>
        <path d="M8 8h8l-8 8h8" strokeWidth="2"/>
      </svg>
    );
    default: return (
      <svg width={s} height={s} viewBox="0 0 24 24" {...p} strokeWidth="1.5"><circle cx="12" cy="12" r="8"/></svg>
    );
  }
}

// ── Command Palette ──
function CommandPalette({ tools, onClose }) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const recents = tools.filter(t => t.status === "active").slice(0, 3);

  const results = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tools;
    return tools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.includes(q))
    );
  }, [query, tools]);

  React.useEffect(() => { setSelected(0); }, [results]);

  const displayList = query ? results : tools;

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, displayList.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && displayList[selected]) { window.open(displayList[selected].url, "_blank"); onClose(); }
    if (e.key === "Escape") onClose();
  };

  const PaletteRow = ({ t, i, isSelected }) => (
    <a
      href={t.url} target="_blank" rel="noopener noreferrer"
      onClick={onClose}
      onMouseEnter={() => setSelected(i)}
      className="tl-palette-item"
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "9px 18px",
        textDecoration: "none", color: "inherit",
        background: isSelected ? "var(--highlight)" : "transparent",
        borderLeft: isSelected ? "2px solid " + t.color : "2px solid transparent",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: isSelected ? t.color + "28" : t.color + "18",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        transition: "background 0.1s",
      }}>
        <ToolIconSm id={t.id} color={t.color} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.name}</span>
          {t.status === "active" && (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--done)", letterSpacing: "0.04em" }}>● active</span>
          )}
          {t.status === "new" && (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--info)", background: "rgba(96,144,186,0.12)", border: "1px solid rgba(96,144,186,0.3)", borderRadius: 3, padding: "0 4px" }}>new</span>
          )}
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t.desc}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "1px 5px" }}>{t.category}</span>
        {isSelected && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>↵</span>}
      </div>
    </a>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh",
      backdropFilter: "blur(6px)",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: 580, background: "var(--surface)", borderRadius: 14,
        border: "1px solid var(--rule)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid var(--hairline)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink-3)" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search tools, categories, tags…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--ink)", fontFamily: "var(--f-ui)", fontSize: 15, letterSpacing: "-0.01em",
            }}
          />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 5, padding: "2px 7px" }}>ESC</span>
        </div>

        {/* Body */}
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {!query && (
            <div style={{ padding: "8px 18px 4px", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Recently active
            </div>
          )}
          {displayList.length === 0 ? (
            <div style={{ padding: "28px 20px", fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
              No tools match "{query}"
            </div>
          ) : (
            displayList.map((t, i) => (
              <PaletteRow key={t.id} t={t} i={i} isSelected={i === selected} />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "9px 18px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 16, alignItems: "center", background: "var(--bg-2)" }}>
          {[["↵", "Open"], ["↑↓", "Navigate"], ["ESC", "Close"]].map(([key, lbl]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>
              <span style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 4, padding: "2px 6px" }}>{key}</span>
              {lbl}
            </span>
          ))}
          <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>
            {displayList.length} tool{displayList.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Tool list row — elevated ──
function ToolCardCompact({ tool, index, delay = 0 }) {
  const [hovered, setHovered] = React.useState(false);
  const trendNew = tool.stat.trend === "new";
  const trendUp  = !trendNew && tool.stat.trend.startsWith("+");
  const trendDown = !trendNew && tool.stat.trend.startsWith("-");
  const trendColor = trendNew ? "var(--info)" : trendUp ? "var(--done)" : trendDown ? "var(--accent)" : "var(--ink-3)";

  const weekDelta = tool.stat.weekSessions - tool.stat.prevWeek;
  const weekLabel = weekDelta > 0 ? "+" + weekDelta + " vs last wk" : weekDelta < 0 ? weekDelta + " vs last wk" : "same as last wk";

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="tl-tool-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "38px 1fr 60px auto",
        alignItems: "center",
        gap: 14,
        padding: "10px 16px",
        background: "transparent",
        borderBottom: "1px solid var(--hairline)",
        borderLeft: "2px solid " + (hovered ? tool.color : "transparent"),
        textDecoration: "none", color: "inherit",
        cursor: "pointer",
        animationDelay: delay + "ms",
      }}
    >
      {/* Icon with status dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: hovered ? tool.color + "30" : tool.color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.12s",
        }}>
          <ToolIconSm id={tool.id} color={tool.color} size={18} />
        </div>
        <div style={{ position: "absolute", bottom: -1, right: -1 }}>
          <StatusDot status={tool.status} color={tool.color} />
        </div>
      </div>

      {/* Name + metadata row + desc */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>{tool.name}</span>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)",
            background: "var(--bg-2)", border: "1px solid var(--hairline)",
            borderRadius: 3, padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{tool.category}</span>
          <StreakBadge count={tool.stat.streak} color={tool.color} />
          {tool.status === "new" && (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--info)", background: "rgba(96,144,186,0.12)", border: "1px solid rgba(96,144,186,0.28)", borderRadius: 3, padding: "1px 5px" }}>new</span>
          )}
          {tool.status === "trending" && (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--done)", opacity: 0.8 }}>↑ trending</span>
          )}
        </div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10.5, color: hovered ? "var(--ink-2)" : "var(--ink-3)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          transition: "color 0.1s",
        }}>{tool.desc}</div>
      </div>

      {/* Sparkline */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <Sparkline data={tool.sparkline} color={tool.color} width={52} height={18} />
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: weekDelta > 0 ? "var(--done)" : weekDelta < 0 ? "var(--accent)" : "var(--ink-3)" }}>
          {weekLabel}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ textAlign: "right", minWidth: 42 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", letterSpacing: "-0.02em" }}>{tool.stat.sessions}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>sessions</div>
        </div>
        <div style={{ textAlign: "right", minWidth: 52 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>{tool.stat.lastUsed}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>last used</div>
        </div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10.5, fontWeight: 500,
          color: trendColor,
          background: trendColor === "var(--ink-3)" ? "transparent" : trendColor + "14",
          border: "1px solid " + (trendColor === "var(--ink-3)" ? "var(--hairline)" : trendColor + "30"),
          borderRadius: 4, padding: "2px 8px", minWidth: 46, textAlign: "center",
        }}>{trendNew ? "new" : tool.stat.trend}</div>
        {hovered && (
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: tool.color, fontWeight: 500, minWidth: 52 }}>Open ↗</span>
        )}
      </div>
    </a>
  );
}

// Grid card — own component to avoid hooks-in-map violation
function ToolGridCard({ tool }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={tool.url} target="_blank" rel="noopener noreferrer"
      className="tl-grid-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px",
        background: hovered ? "var(--highlight)" : "var(--surface)",
        border: "1px solid " + (hovered ? tool.color + "50" : "var(--hairline)"),
        borderRadius: 10, textDecoration: "none", color: "inherit",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: tool.color,
        opacity: hovered ? 1 : 0.4,
        transition: "opacity 0.14s",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: tool.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ToolIconSm id={tool.id} color={tool.color} size={18} />
          </div>
          <div style={{ position: "absolute", bottom: -1, right: -1 }}>
            <StatusDot status={tool.status} color={tool.color} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <StreakBadge count={tool.stat.streak} color={tool.color} />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "1px 5px" }}>{tool.shortcut}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 1 }}>{tool.name}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{tool.category}</div>
      </div>
      <Sparkline data={tool.sparkline} color={tool.color} width={80} height={20} />
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", borderTop: "1px solid var(--hairline)", paddingTop: 8, marginTop: 2 }}>
        <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>{tool.stat.sessions}<span style={{ fontWeight: 400, color: "var(--ink-3)" }}> sess</span></span>
        <span>{tool.stat.lastUsed}</span>
      </div>
    </a>
  );
}

// ── AI Suggestion card ──
function SuggestionCard({ s, index }) {
  const tool = TOOLS_DATA.find(t => t.id === s.tool);
  const pCfg = {
    high:   { color: "var(--accent)",  bg: "rgba(169,114,88,0.08)",  dot: "●", label: "HIGH"   },
    medium: { color: "var(--info)",    bg: "rgba(96,144,186,0.07)",  dot: "●", label: "MED"    },
    low:    { color: "var(--ink-3)",   bg: "transparent",             dot: "○", label: "LOW"    },
  }[s.priority] || { color: "var(--ink-3)", bg: "transparent", dot: "○", label: "" };

  return (
    <a
      href={tool.url} target="_blank" rel="noopener noreferrer"
      className="tl-sugg-card"
      style={{
        display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px",
        marginBottom: 5, background: pCfg.bg,
        border: "1px solid var(--hairline)",
        borderLeft: "3px solid " + pCfg.color,
        borderRadius: 8, textDecoration: "none", color: "inherit",
        animationDelay: (index * 60) + "ms",
        "--border-color": pCfg.color,
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 7, background: tool.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <ToolIconSm id={tool.id} color={tool.color} size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{tool.name}</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: pCfg.color, letterSpacing: "0.08em" }}>{pCfg.dot} {pCfg.label}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.4, marginBottom: 3 }}>{s.reason}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{s.context}</div>
      </div>
      <div style={{ flexShrink: 0, fontFamily: "var(--f-mono)", fontSize: 10.5, color: pCfg.color, fontWeight: 500, marginTop: 2, whiteSpace: "nowrap" }}>
        {s.actionLabel}
      </div>
    </a>
  );
}

// ── Quick action row ──
function QuickActionRow({ action, index }) {
  const tool = TOOLS_DATA.find(t => t.id === action.tool);
  return (
    <a
      href={tool.url} target="_blank" rel="noopener noreferrer"
      className="tl-act-row"
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
        borderBottom: index < QUICK_ACTIONS.length - 1 ? "1px solid var(--hairline)" : "none",
        textDecoration: "none", color: "inherit", background: "transparent",
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 7, background: tool.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ToolIconSm id={tool.id} color={tool.color} size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{action.label}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginTop: 1 }}>{action.desc}</div>
      </div>
      <span style={{
        fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-2)",
        background: "var(--bg-2)", border: "1px solid var(--rule)",
        borderRadius: 5, padding: "2px 7px", flexShrink: 0,
        letterSpacing: "0.02em",
      }}>{action.shortcut}</span>
    </a>
  );
}

// ── Activity feed item ──
function ActivityItem({ entry, index, showGroupLabel, isLast }) {
  const tool = TOOLS_DATA.find(t => t.id === entry.tool);
  return (
    <>
      {showGroupLabel && (
        <div style={{ padding: "6px 14px 4px", fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", borderBottom: "none" }}>
          {entry.group === "now" ? "● Just now" : entry.group === "today" ? "Today" : "Yesterday"}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 14px", position: "relative" }}>
        {/* Timeline line */}
        {!isLast && (
          <div style={{ position: "absolute", left: 18, top: 22, bottom: -7, width: 1, background: "var(--hairline)", zIndex: 0 }} />
        )}
        {/* Dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: tool.color,
          flexShrink: 0, marginTop: 5, zIndex: 1, flexShrink: 0,
          boxShadow: entry.group === "now" ? "0 0 0 3px " + tool.color + "25" : "none",
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{entry.action}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>{tool.name}</span>
          </div>
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: entry.group === "now" ? tool.color : "var(--ink-3)", flexShrink: 0, fontWeight: entry.group === "now" ? 500 : 400 }}>
          {entry.time}
        </span>
      </div>
    </>
  );
}

// ── Usage bar with sparkline ──
function UsageBar({ tool, totalSessions }) {
  const pct = Math.round(tool.stat.sessions / totalSessions * 100);
  const weekDelta = tool.stat.weekSessions - tool.stat.prevWeek;
  const deltaColor = weekDelta > 0 ? "var(--done)" : weekDelta < 0 ? "var(--accent)" : "var(--ink-3)";
  const deltaStr = weekDelta > 0 ? "+" + weekDelta : weekDelta === 0 ? "—" : String(weekDelta);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "10px 1fr 28px 36px", alignItems: "center", gap: 8, marginBottom: 9 }}>
      <StatusDot status={tool.status} color={tool.color} />
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em" }}>{tool.name}</span>
            {tool.stat.streak > 2 && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: tool.color, opacity: 0.8 }}>🔥{tool.stat.streak}</span>
            )}
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>{tool.stat.sessions}</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ flex: 1, height: 3, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct + "%", background: tool.color, borderRadius: 2, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <Sparkline data={tool.sparkline} color={tool.color} width={28} height={10} />
        </div>
      </div>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: deltaColor, textAlign: "right" }}>{deltaStr}</span>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

function ToolsContent() {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("All");
  const [view, setView] = React.useState("list");
  const [statsVisible, setStatsVisible] = React.useState(false);

  const categories = ["All", "AI", "Design", "Productivity"];
  const filtered = filter === "All" ? TOOLS_DATA : TOOLS_DATA.filter(t => t.category === filter);

  React.useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const totalSessions = TOOLS_DATA.reduce((s, t) => s + t.stat.sessions, 0);
  const topTool = TOOLS_DATA.reduce((a, b) => a.stat.sessions > b.stat.sessions ? a : b);
  const aiCount = TOOLS_DATA.filter(t => t.category === "AI").length;
  const activeCount = TOOLS_DATA.filter(t => t.status === "active").length;
  const totalWeekSessions = TOOLS_DATA.reduce((s, t) => s + t.stat.weekSessions, 0);
  const totalPrevWeek = TOOLS_DATA.reduce((s, t) => s + t.stat.prevWeek, 0);
  const weekChange = totalWeekSessions - totalPrevWeek;

  // Group activity by group key
  const activityGroups = ACTIVITY_LOG.reduce((acc, e) => {
    if (!acc[e.group]) acc[e.group] = [];
    acc[e.group].push(e);
    return acc;
  }, {});

  const sortedByUsage = [...TOOLS_DATA].sort((a, b) => b.stat.sessions - a.stat.sessions);

  return (
    <>
      <ToolsStyleBlock />
      {paletteOpen && <CommandPalette tools={TOOLS_DATA} onClose={() => setPaletteOpen(false)} />}

      {/* ── Header ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 10 }}>
            <span>Tools</span>
            <span style={{ color: "var(--hairline)" }}>·</span>
            <span>{TOOLS_DATA.length} connected</span>
            <span style={{ color: "var(--hairline)" }}>·</span>
            <span style={{ color: activeCount > 0 ? "var(--done)" : "var(--ink-3)" }}>
              <span className={activeCount > 0 ? "tl-blink" : ""} style={{ marginRight: 4 }}>●</span>
              {activeCount} active
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 6, padding: 2 }}>
              {[["list", "≡"], ["grid", "⊞"]].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)} style={{
                  width: 28, height: 22, borderRadius: 4, border: "none",
                  background: view === v ? "var(--surface)" : "transparent",
                  color: view === v ? "var(--ink)" : "var(--ink-3)",
                  cursor: "pointer", fontSize: 13, display: "grid", placeItems: "center",
                  boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                  transition: "all 0.1s",
                }}>{icon}</button>
              ))}
            </div>
            <button
              onClick={() => setPaletteOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "7px 12px",
                background: "var(--surface)", border: "1px solid var(--rule)",
                borderRadius: 8, cursor: "pointer", color: "var(--ink-2)",
                fontFamily: "var(--f-ui)", fontSize: 12.5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
              Search tools
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 4, padding: "1px 6px" }}>⌘K</span>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <h1 style={{ fontFamily: "var(--f-display)", fontSize: 26, margin: 0, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Your <em style={{ color: "var(--accent-ink)" }}>command center</em>
          </h1>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: weekChange > 0 ? "var(--done)" : "var(--ink-3)" }}>
            {weekChange > 0 ? "+" : ""}{weekChange} sessions vs last week
          </span>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          {
            label: "This week",
            value: totalWeekSessions,
            sub: weekChange > 0 ? "+" + weekChange + " vs last week" : weekChange + " vs last week",
            subColor: weekChange > 0 ? "var(--done)" : "var(--ink-3)",
            icon: "W",
          },
          {
            label: "Top tool",
            value: topTool.name,
            sub: topTool.stat.sessions + " total · " + topTool.stat.weekSessions + " this wk",
            color: topTool.color,
            icon: "★",
          },
          {
            label: "Connected",
            value: TOOLS_DATA.length,
            sub: aiCount + " AI · " + activeCount + " active now",
            icon: "◎",
          },
          {
            label: "Last opened",
            value: "Claude",
            sub: "2 min ago · AI category",
            color: "#d97757",
            icon: "↺",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="tl-stat-card"
            style={{
              padding: "11px 14px",
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
              borderRadius: 9,
              opacity: statsVisible ? 1 : 0,
              transform: statsVisible ? "none" : "translateY(4px)",
              transition: "opacity 0.25s ease " + (i * 50) + "ms, transform 0.25s ease " + (i * 50) + "ms, border-color 0.12s, box-shadow 0.12s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</div>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", opacity: 0.5 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, color: s.color || "var(--ink)", fontFamily: "var(--f-display)", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: s.subColor || "var(--ink-3)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 14, alignItems: "start" }}>

        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* AI Suggestions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "var(--accent-ink)", fontStyle: "normal" }}>✦</span> Intelligent suggestions
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)" }}>3 active</span>
            </div>
            {AI_SUGGESTIONS.map((s, i) => <SuggestionCard key={i} s={s} index={i} />)}
          </div>

          {/* Filter + list header */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {categories.map(cat => {
                const count = cat === "All" ? TOOLS_DATA.length : TOOLS_DATA.filter(t => t.category === cat).length;
                const active = filter === cat;
                return (
                  <button key={cat} onClick={() => setFilter(cat)} style={{
                    padding: "3px 10px", borderRadius: 5,
                    border: "1px solid " + (active ? "var(--ink-2)" : "var(--hairline)"),
                    background: active ? "var(--surface)" : "transparent",
                    color: active ? "var(--ink)" : "var(--ink-3)",
                    fontFamily: "var(--f-mono)", fontSize: 10.5,
                    cursor: "pointer", transition: "all 0.1s",
                    display: "flex", alignItems: "center", gap: 5,
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.14)" : "none",
                  }}>
                    {cat}
                    <span style={{ opacity: 0.5, fontSize: 9 }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>{filtered.length} tool{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Tool list / grid */}
          {view === "list" ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden" }}>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "38px 1fr 60px auto", gap: 14, padding: "6px 16px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
                <div />
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tool</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>7d activity</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right", paddingRight: 0 }}>Sessions · Last used · Trend</div>
              </div>
              {filtered.map((tool, i) => (
                <ToolCardCompact key={tool.id} tool={tool} index={i} delay={i * 30} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(172px, 1fr))", gap: 9 }}>
              {filtered.map(tool => <ToolGridCard key={tool.id} tool={tool} />)}
            </div>
          )}
        </div>

        {/* ── RIGHT sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Quick Actions */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px 8px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Quick Launch</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 4, padding: "1px 6px" }}>⌘1–4</span>
            </div>
            {QUICK_ACTIONS.map((action, i) => <QuickActionRow key={i} action={action} index={i} />)}
            <div style={{ padding: "7px 14px", borderTop: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
              <button onClick={() => setPaletteOpen(true)} style={{
                width: "100%", padding: "5px 0", background: "transparent", border: "none",
                fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "color 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink-2)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--ink-3)"}
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                Browse all tools — ⌘K
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px 8px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="tl-blink" style={{ color: "var(--done)", fontSize: 8 }}>●</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Activity</span>
              </div>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)" }}>last 24h</span>
            </div>
            <div style={{ padding: "4px 0 6px" }}>
              {ACTIVITY_LOG.map((entry, i) => {
                const prevEntry = i > 0 ? ACTIVITY_LOG[i - 1] : null;
                const showGroupLabel = !prevEntry || prevEntry.group !== entry.group;
                const isLast = i === ACTIVITY_LOG.length - 1;
                return (
                  <ActivityItem key={i} entry={entry} index={i} showGroupLabel={showGroupLabel} isLast={isLast} />
                );
              })}
            </div>
          </div>

          {/* Usage breakdown */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Usage breakdown</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)" }}>Δ this week</span>
            </div>
            {sortedByUsage.map(tool => (
              <UsageBar key={tool.id} tool={tool} totalSessions={totalSessions} />
            ))}
            <div style={{ borderTop: "1px solid var(--hairline)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>
              <span>{totalSessions} total sessions</span>
              <span style={{ color: weekChange > 0 ? "var(--done)" : "var(--ink-3)" }}>{weekChange > 0 ? "+" : ""}{weekChange} this week</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ToolsContent, QuizzesContent, TakeQuiz, ScheduleContent, GradesContent, FlashcardsContent, NotesIndexContent, PracticeCard, QuizDetailPage });
