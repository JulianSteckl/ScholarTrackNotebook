// Subject Overview — per-class workspace

// ── Area sparkline with gradient fill ───────────────────────────────
function SubjectSparklineArea({ color, points, width, height }) {
  points = points || [78, 82, 80, 85, 84, 87, 90, 89];
  width = width || 140;
  height = height || 44;
  const w = width, h = height;
  const min = Math.min.apply(null, points) - 4;
  const max = Math.max.apply(null, points) + 2;
  const toY = function(v) { return h - ((v - min) / (max - min)) * (h - 6); };

  const coords = points.map(function(p, i) {
    return [(i / (points.length - 1)) * w, toY(p)];
  });

  let linePath = "M " + coords[0][0] + " " + coords[0][1];
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpX = (prev[0] + curr[0]) / 2;
    linePath += " C " + cpX + " " + prev[1] + ", " + cpX + " " + curr[1] + ", " + curr[0] + " " + curr[1];
  }

  const areaPath = linePath + " L " + w + " " + h + " L 0 " + h + " Z";
  const lastX = coords[coords.length - 1][0];
  const lastY = coords[coords.length - 1][1];
  const gradId = "sg-" + color.replace("#", "");

  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={"url(#" + gradId + ")"} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} />
      <circle cx={lastX} cy={lastY} r="7" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

// Keep original export for any external references
function SubjectSparkline({ color }) {
  return <SubjectSparklineArea color={color} width={120} height={36} />;
}

// ── Today snapshot banner ────────────────────────────────────────────
function SubjectTodayWidget({ subject: s, onOpenNotes, onOpenQuiz }) {
  const sched = nbGetSchedule();
  const now = new Date();
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];

  const todayPeriod = sched.find(function(p) { return p.subject === s.id; });
  const subjectQuiz = QUIZZES_UPCOMING.find(function(q) { return q.subject === s.id; });
  const todayHW = [...HOMEWORK, ...nbGetHomework()].filter(function(h) {
    return h.subject === s.id && !h.done && (h.due === "Tonight" || h.due === "Tomorrow");
  });

  let sessionStatus = null;
  if (todayPeriod) {
    const start = schedToMinutes(todayPeriod.time);
    const end = todayPeriod.end ? schedToMinutes(todayPeriod.end) : start + 50;
    if (todayMinutes >= start && todayMinutes < end) sessionStatus = "now";
    else if (todayMinutes < start) sessionStatus = "upcoming";
    else sessionStatus = "done";
  }

  const isEmpty = !todayPeriod && todayHW.length === 0 && !subjectQuiz;
  if (isEmpty) return null;

  return (
    <div className="so-today-banner" style={{ borderColor: s.color + "55", background: sessionStatus === "now" ? s.color + "0a" : undefined }}>
      <div className="so-today-left">
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 7, display: "flex", alignItems: "center", gap: 8 }}>
          {todayDayName} · Today's snapshot
          {sessionStatus === "now" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: s.color, fontFamily: "var(--f-mono)", fontSize: 10 }}>
              <span className="so-live-dot" style={{ background: s.color }} />
              In Session
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
          {todayPeriod && (
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Class time</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1 }}>
                {todayPeriod.time}
                {sessionStatus === "upcoming" && <span style={{ marginLeft: 6, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>upcoming</span>}
                {sessionStatus === "done" && <span style={{ marginLeft: 6, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>done for today</span>}
              </div>
              {todayPeriod.note && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{todayPeriod.note}</div>}
            </div>
          )}
          {todayHW.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Due soon</div>
              {todayHW.slice(0, 2).map(function(h) {
                return (
                  <div key={h.id} style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1.3 }}>
                    {h.title} <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: h.urgent ? s.color : "var(--ink-3)" }}>{h.due}</span>
                  </div>
                );
              })}
            </div>
          )}
          {subjectQuiz && (
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Quiz</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 15 }}>{subjectQuiz.when} · {subjectQuiz.title.slice(0, 30)}</div>
              <ConfidenceMeter value={subjectQuiz.confidence} />
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <button className="sn-btn ghost" onClick={function() { onOpenNotes(s.id); }} style={{ fontSize: 12 }}>Notes</button>
        {subjectQuiz && <button className="sn-btn ghost" onClick={function() { onOpenQuiz("mcq"); }} style={{ fontSize: 12 }}>Practice →</button>}
      </div>
    </div>
  );
}

// ── Individual note preview card ─────────────────────────────────────
function NoteCard({ note, subjectColor, onClick }) {
  const excerpt = note.blocks
    ? ((note.blocks.find(function(b) { return b.type === "p"; }) || note.blocks[0]) || {}).text || ""
    : "";
  const wordCount = excerpt.split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const hasBullet = note.blocks && note.blocks.some(function(b) { return b.type === "li"; });

  return (
    <div className="so-note-card" onClick={onClick}>
      <div className="so-note-card-accent" style={{ background: subjectColor }} />
      <div className="so-note-card-body">
        <div className="so-note-card-header">
          <div className="so-note-card-title">{note.title}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", flexShrink: 0 }}>{note.when}</div>
        </div>
        {excerpt && (
          <div className="so-note-card-excerpt">{excerpt}</div>
        )}
        <div className="so-note-card-footer">
          {hasBullet && <span className="chip" style={{ fontSize: 9.5, padding: "2px 5px" }}>bullets</span>}
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginLeft: "auto" }}>{readMins} min read</span>
        </div>
      </div>
    </div>
  );
}

// ── Flashcard deck row with mastery bar ──────────────────────────────
function DeckRow({ deckId, deck, subjectColor, onClick, index, total }) {
  const due = Math.abs(deckId.split("").reduce(function(a, c) { return a + c.charCodeAt(0); }, 0)) % 9;
  const pct = Math.round(((deck.cards.length - due) / deck.cards.length) * 100);

  return (
    <div onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 7,
      padding: "10px 0",
      borderBottom: index < total - 1 ? "1px dashed var(--hairline)" : "none",
      cursor: "pointer"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 13.5 }}>{deck.title}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: due > 0 ? subjectColor : "var(--done)" }}>
          {due > 0 ? due + " due" : "all caught up"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 2, background: "var(--hairline)", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: subjectColor, borderRadius: 1, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{deck.cards.length} cards</div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
function SubjectOverviewContent({ subjectId, onOpenNotes, onOpenQuiz, onOpenHomework }) {
  const s = subjectBy(subjectId);
  if (!s) return null;

  const subjectHW = HOMEWORK.filter(function(h) { return h.subject === subjectId; });
  const openHW = subjectHW.filter(function(h) { return !h.done; });
  const urgentCount = openHW.filter(function(h) { return h.urgent; }).length;
  const subjectQuiz = QUIZZES_UPCOMING.find(function(q) { return q.subject === subjectId; });
  const subjectNotes = notesForSubject(subjectId);
  const subjectDecks = Object.entries(DECKS).filter(function(e) { return e[1].subject === s.id; });
  const periodNum = (SUBJECTS.indexOf(s) % 7) + 1;

  // Session status for hero badge
  const sched = nbGetSchedule();
  const now = new Date();
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const todayPeriod = sched.find(function(p) { return p.subject === s.id; });
  let sessionStatus = null;
  if (todayPeriod) {
    const start = schedToMinutes(todayPeriod.time);
    const end = todayPeriod.end ? schedToMinutes(todayPeriod.end) : start + 50;
    if (todayMinutes >= start && todayMinutes < end) sessionStatus = "now";
    else if (todayMinutes < start) sessionStatus = "upcoming";
    else sessionStatus = "done";
  }

  return (
    <div className="so-workspace">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="so-hero">
        <div className="so-hero-color-bar" style={{ background: s.color }} />
        <div className="so-hero-inner">

          {/* Identity */}
          <div className="so-hero-identity">
            <div className="so-hero-glyph-wrap" style={{ borderColor: s.color + "50", background: s.color + "0d" }}>
              <SubjectGlyph id={s.id} size={22} color={s.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="so-hero-eyebrow">
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.13em" }}>
                  {s.short} · Period {periodNum} · Room {s.room} · {s.teacher}
                </span>
                {sessionStatus === "now" && (
                  <span className="so-live-badge" style={{ borderColor: s.color + "55", color: s.color }}>
                    <span className="so-live-dot" style={{ background: s.color }} />
                    In Session
                  </span>
                )}
                {sessionStatus === "upcoming" && (
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", background: "var(--bg-2)", padding: "2px 7px", borderRadius: 3, border: "1px solid var(--hairline)" }}>
                    {todayPeriod.time} today
                  </span>
                )}
              </div>
              <h1 className="so-hero-title">{s.name}</h1>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2 }}>
                Unit 3 · Cellular Energetics ·{" "}
                <strong style={{ color: "var(--ink)" }}>{s.notes}</strong> notes ·{" "}
                <strong style={{ color: "var(--ink)" }}>{subjectHW.length}</strong> assignments ·{" "}
                <strong style={{ color: "var(--ink)" }}>{s.quizzes}</strong> quizzes this term
              </div>
            </div>
          </div>

          {/* Grade + sparkline + actions */}
          <div className="so-hero-grade-block">
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, textAlign: "right" }}>
                Grade · This term
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, justifyContent: "flex-end" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 54, lineHeight: 1, letterSpacing: "-0.03em", color: "var(--ink)" }}>{s.grade}</div>
                <div style={{ paddingBottom: 6 }}>
                  <SubjectSparklineArea color={s.color} />
                </div>
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, marginTop: 5, color: "var(--done)", textAlign: "right" }}>
                ↑ 2.4 pts since last report
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
              <button className="sn-btn ghost" onClick={function() {
                window.dispatchEvent(new CustomEvent("toast", { detail: s.name + " · Period " + periodNum + " · Room " + s.room + " · " + s.teacher }));
              }}>
                Class info
              </button>
              <button className="sn-btn primary" onClick={function() { onOpenNotes(subjectId); }}>
                Open notes →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Today snapshot (contextual) ───────────────────────────── */}
      <SubjectTodayWidget subject={s} onOpenNotes={onOpenNotes} onOpenQuiz={onOpenQuiz} />

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="so-body">

        {/* Primary: Notes + Homework */}
        <div className="so-primary">

          {/* Notes section */}
          <div className="so-section-header">
            <div>
              <div className="so-section-label">Notes</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", marginTop: 1 }}>
                {subjectNotes.length > 0 ? subjectNotes.length + " notes · Unit 3" : "Your notes for this class"}
              </div>
            </div>
            <button className="sn-btn ghost" onClick={function() { onOpenNotes(subjectId); }} style={{ fontSize: 12 }}>
              {subjectNotes.length > 0 ? "All notes →" : "+ New note"}
            </button>
          </div>

          {subjectNotes.length > 0 ? (
            <div className="so-notes-grid stagger-children">
              {subjectNotes.slice(0, 4).map(function(n) {
                return (
                  <NoteCard
                    key={n.id}
                    note={n}
                    subjectColor={s.color}
                    onClick={function() { onOpenNotes(subjectId, n.id); }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="so-notes-empty">
              <div className="so-notes-empty-glyph">
                <SubjectGlyph id={s.id} size={38} color={s.color + "66"} />
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 20, color: "var(--ink-2)", marginBottom: 6 }}>
                Start your first {s.short} note
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, maxWidth: 260 }}>
                Your notes will appear here. Great notes make the difference come exam time.
              </div>
              <button className="sn-btn primary" onClick={function() { onOpenNotes(subjectId); }} style={{ marginTop: 18 }}>
                + Create first note
              </button>
            </div>
          )}

          {/* Homework section */}
          <div className="so-section-header" style={{ marginTop: 28 }}>
            <div>
              <div className="so-section-label">Homework</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", marginTop: 1 }}>
                {openHW.length > 0 ? openHW.length + " open · " + urgentCount + " urgent" : "All caught up"}
              </div>
            </div>
            <button className="sn-btn ghost" onClick={function() { onOpenHomework(); }} style={{ fontSize: 12 }}>All →</button>
          </div>

          {subjectHW.length > 0 ? (
            <div className="sn-card" style={{ padding: "4px 20px" }}>
              <HomeworkList items={subjectHW} compact />
            </div>
          ) : (
            <div className="so-empty-card">
              <span style={{ fontSize: 18 }}>✓</span>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--done)", fontSize: 15 }}>
                You're all caught up on {s.short} homework.
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Stats + Quiz + Flashcards + Pinned note */}
        <div className="so-sidebar-col">

          {/* Stat pills */}
          <div className="so-stat-row">
            <div className="so-stat-pill">
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Next class</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1.1, marginTop: 5 }}>Wed</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>10:10 AM · Rm {s.room}</div>
            </div>
            <div className="so-stat-pill">
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Open work</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1.1, marginTop: 5, color: openHW.length > 0 ? "var(--ink)" : "var(--ink-3)" }}>
                {openHW.length}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, marginTop: 3, color: urgentCount > 0 ? s.color : "var(--ink-3)" }}>
                {urgentCount > 0 ? urgentCount + " urgent" : "all clear"}
              </div>
            </div>
          </div>

          {/* Quiz */}
          {subjectQuiz ? (
            <div className="sn-card" style={{ borderLeft: "3px solid " + s.color }}>
              <div className="sn-card-title"><span>Upcoming quiz</span></div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 19, lineHeight: 1.25, marginBottom: 4 }}>
                {subjectQuiz.title}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginBottom: 12 }}>
                {subjectQuiz.when.toUpperCase()} · {subjectQuiz.length}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Confidence</div>
              <ConfidenceMeter value={subjectQuiz.confidence} />
              <button className="sn-btn primary" onClick={function() { onOpenQuiz("mcq"); }} style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>
                Practice now →
              </button>
            </div>
          ) : (
            <div className="so-empty-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Upcoming quiz</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14 }}>
                No quiz scheduled — enjoy the break.
              </div>
            </div>
          )}

          {/* Flashcard decks */}
          <div className="sn-card">
            <h3 className="sn-card-title"><span>Flashcard decks</span></h3>
            {subjectDecks.length > 0 ? (
              <div>
                {subjectDecks.map(function(entry, i) {
                  return (
                    <DeckRow
                      key={entry[0]}
                      deckId={entry[0]}
                      deck={entry[1]}
                      subjectColor={s.color}
                      onClick={function() { onOpenQuiz("flashcard", entry[0]); }}
                      index={i}
                      total={subjectDecks.length}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}>
                No decks yet. Create one from your notes.
              </div>
            )}
          </div>

          {/* Pinned margin note */}
          <div className="sn-card paper">
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Pinned note</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.5, borderLeft: "2px solid " + s.color, paddingLeft: 12 }}>
              {s.id === "ap-bio" && "Lab report needs three graphs (not two) + outliers discussion."}
              {s.id === "ap-lit" && "Sethe's milk: nourishment AND theft. Use for the body paragraph on motherhood."}
              {s.id === "alg2" && "When in doubt on double-angle, substitute cos²θ = 1 − sin²θ and see what cancels."}
              {!["ap-bio", "ap-lit", "alg2"].includes(s.id) && "Tap any note to pin a margin annotation here for next class."}
            </div>
            <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>— Tue 10:24 · class</div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Keep for any external callers
function NoteSamplesForSubject({ subjectId, onOpen }) {
  const placeholders = {
    "ap-lit": ["Beloved — motifs of memory", "The Great Gatsby — green light", "Toni Morrison — voice & rhythm"],
    "alg2": ["Double-angle identities", "Law of sines", "Inverse trig functions"],
    "us-hist": ["Federalist No. 10 — factions", "Causes of the Civil War", "Reconstruction amendments"],
    "spanish-3": ["Pretérito vs Imperfecto", "Subjuntivo — when to use", "Vocabulario Unidad 6"],
    "chem": ["Molarity & dilutions", "Periodic trends", "Stoichiometry"],
    "studio-art": ["Charcoal techniques", "Composition rules", "Color theory basics"],
    "phys-ed": ["Workout log — May", "Mile time tracking"],
  };
  const list = placeholders[subjectId] || ["Notes will appear here"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map(function(t, i) {
        return (
          <div key={i} onClick={onOpen} style={{ paddingBottom: 10, borderBottom: i < list.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{t}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{["yesterday", "Mon", "last week", "Apr 30", "Apr 28"][i % 5]}</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { SubjectOverviewContent });
