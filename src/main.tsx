import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Icon } from "./Icon";
import {
  initialRooms,
  initialDMs,
  people,
  me,
  type Person,
  type Message,
} from "./data";
import "./style.css";
function Avatar({
  person,
  small = false,
}: {
  person: Person;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${person.color} ${small ? "small" : ""}`}
      aria-hidden="true"
    >
      {person.id.slice(0, 2)}
    </span>
  );
}
const person = (id: string) => people.find((p) => p.id === id)!;
const alias = (id: string) => `anon-${id.toLowerCase()}`;
type View = { kind: "room" | "dm" | "discover"; id: string };
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    ref.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [title]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function App() {
  const [rooms, setRooms] = useState(structuredClone(initialRooms));
  const [dms, setDms] = useState(structuredClone(initialDMs));
  const [view, setView] = useState<View>({
    kind: "room",
    id: initialRooms[0].id,
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<
    "create" | "dm" | "rooms" | "details" | "reset" | "command" | null
  >(null);
  const [command, setCommand] = useState("");
  const [topic, setTopic] = useState("");
  const [toast, setToast] = useState("");
  const [emoji, setEmoji] = useState(false);
  const [typing, setTyping] = useState<Record<string, number>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scroll = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const room =
    view.kind === "room" ? rooms.find((r) => r.id === view.id) : undefined;
  const key = `${view.kind}:${view.id}`;
  const draft = drafts[key] || "";
  const messages =
    room?.messages || (view.kind === "dm" ? dms[view.id] || [] : []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand("");
        setModal((current) => (current === "command" ? null : "command"));
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const previousView = useRef("");
  useEffect(() => {
    if (scroll.current)
      scroll.current.scrollTop =
        previousView.current === key ? scroll.current.scrollHeight : 0;
    previousView.current = key;
  }, [key, messages.length]);
  function change(next: View) {
    setView(next);
    setEmoji(false);
    setModal(null);
  }
  function join(id: string) {
    setRooms((rs) =>
      rs.map((r) =>
        r.id === id
          ? {
              ...r,
              joined: true,
              unread: 0,
              members: r.members.includes(me.id)
                ? r.members
                : [...r.members, me.id],
            }
          : r,
      ),
    );
    change({ kind: "room", id });
  }
  function dm(id: string) {
    if (id === me.id) return;
    setDms((ds) => ({ ...ds, [id]: ds[id] || [] }));
    change({ kind: "dm", id });
  }
  function update(fn: (ms: Message[]) => Message[], target = view) {
    if (target.kind === "room")
      setRooms((rs) =>
        rs.map((r) =>
          r.id === target.id ? { ...r, messages: fn(r.messages) } : r,
        ),
      );
    else setDms((ds) => ({ ...ds, [target.id]: fn(ds[target.id] || []) }));
  }
  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const target = { ...view };
    const newMessage = (author: string, text: string): Message => ({
      id: crypto.randomUUID(),
      author,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });
    update((ms) => [...ms, newMessage(me.id, draft.trim())]);
    setDrafts((ds) => ({ ...ds, [key]: "" }));
    setEmoji(false);
    const other =
      room?.members.find((id) => id !== me.id) ||
      (view.kind === "dm" ? view.id : undefined);
    if (other) {
      setTyping((t) => ({ ...t, [key]: (t[key] || 0) + 1 }));
      const answers = [
        "Glad you wandered in. What’s on your mind?",
        "I like that thought. Tell me a little more.",
        "Sometimes a small conversation is exactly what you need.",
      ];
      const answer =
        answers[
          messages.filter((m) => m.author === me.id).length % answers.length
        ];
      timers.current.push(
        setTimeout(() => {
          update((ms) => [...ms, newMessage(other, answer)], target);
          setTyping((t) => ({ ...t, [key]: Math.max(0, (t[key] || 1) - 1) }));
        }, 1100),
      );
    }
    input.current?.focus();
  }
  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRooms(structuredClone(initialRooms));
    setDms(structuredClone(initialDMs));
    setDrafts({});
    setTyping({});
    setSearch("");
    setTopic("");
    change({ kind: "room", id: initialRooms[0].id });
    setToast("Demo reset. A fresh start.");
  }
  async function copy() {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.id);
      setToast("Room ID copied.");
    } catch {
      setToast("Clipboard unavailable. Select the room ID to copy it.");
    }
  }
  const joined = rooms.filter((r) => r.joined);
  const roomLinks = (
    <div className="room-list">
      {joined.map((r) => (
        <button
          key={r.id}
          className={`room-item ${room?.id === r.id ? "active" : ""}`}
          onClick={() => join(r.id)}
        >
          <span className="room-symbol">
            <Icon name="rooms" size={19} />
          </span>
          <span className="room-copy">
            <strong>{r.id.slice(0, 8)}</strong>
            <span>{r.topic}</span>
          </span>
          <span className={r.unread ? "unread" : "room-member-count"}>
            {r.unread || r.members.length}
          </span>
        </button>
      ))}
    </div>
  );
  const dmLinks = Object.entries(dms).map(([id, ms]) => (
    <button
      className={`dm-item ${view.kind === "dm" && view.id === id ? "active" : ""}`}
      key={id}
      onClick={() => dm(id)}
    >
      <Avatar person={person(id)} small />
      <span>
        <strong>{alias(id)}</strong>
        <small>{ms.at(-1)?.text || "A conversation starts here"}</small>
      </span>
    </button>
  ));
  const createButton = (
    <button
      className="primary"
      onClick={() => {
        setTopic("");
        setModal("create");
      }}
    >
      <Icon name="plus" size={17} />
      Create a room
    </button>
  );
  const details = (
    <>
      <div className="details-title">
        {room ? "PARTICIPANTS" : "PRIVATE SESSION"}
        <span>{room?.members.length || 2}</span>
      </div>
      <p className="details-subtitle">
        {room ? "Different people. Same place." : "A quieter corner of drift."}
      </p>
      <div className="member-list">
        {(room?.members || [view.id, me.id])
          .filter((id) => people.some((p) => p.id === id))
          .map((id) => (
            <button
              className="member"
              key={id}
              disabled={id === me.id}
              onClick={() => dm(id)}
              aria-label={
                id === me.id
                  ? "Your anonymous identity"
                  : `Start DM with ${alias(id)}`
              }
            >
              <Avatar person={person(id)} small />
              <span>
                <strong>
                  {alias(id)}
                  {id === me.id && <small>you</small>}
                </strong>
                <span>{person(id).note}</span>
              </span>
              {id !== me.id && <Icon name="message" size={15} />}
            </button>
          ))}
      </div>
      {room && (
        <section className="room-id-card">
          <span className="eyebrow">ROOM IDENTITY</span>
          <div className="passport-icon">
            <Icon name="rooms" size={27} />
          </div>
          <strong>{room.topic}</strong>
          <p>Every room is a place of its own.</p>
          <code>{room.id}</code>
          <button onClick={copy}>
            <Icon name="copy" size={15} /> Copy room ID
          </button>
        </section>
      )}
      <div className="room-principle">
        <Icon name="info" size={16} />
        <p>
          People over profiles.
          <br />
          You choose what to share.
        </p>
      </div>
    </>
  );
  return (
    <div
      className={`app-shell ${view.kind === "discover" ? "discover-shell" : ""}`}
    >
      <nav className="rail" aria-label="Workspace">
        <button
          className="brand-mark"
          onClick={() => join(initialRooms[0].id)}
          aria-label="Drift home"
        >
          <span className="terminal-mark">&gt;_</span>
          <strong>drift</strong>
          <small>/ chat</small>
        </button>
        <span className="rail-rule" />
        {(["room", "discover", "dm"] as const).map((kind, i) => (
          <button
            key={kind}
            className={`rail-button ${view.kind === kind ? "selected" : ""}`}
            aria-label={["Rooms", "Discover rooms", "Direct messages"][i]}
            title={["Rooms", "Discover rooms", "Direct messages"][i]}
            onClick={() =>
              kind === "discover"
                ? change({ kind, id: "" })
                : setModal(kind === "room" ? "rooms" : "dm")
            }
          >
            <span className="nav-index">0{i + 1}</span>
            <span>{["rooms", "explore", "messages"][i]}</span>
          </button>
        ))}
        <button
          className="command-trigger"
          aria-label="Open command palette"
          onClick={() => {
            setCommand("");
            setModal("command");
          }}
        >
          <Icon name="search" size={15} />
          <span>Jump to…</span>
          <kbd>⌘ / Ctrl K</kbd>
        </button>
        <div className="rail-bottom">
          <button
            className="rail-button"
            aria-label="Reset demo"
            title="Reset demo"
            onClick={() => setModal("reset")}
          >
            <Icon name="reset" size={19} />
          </button>
          <span className="identity-orb" title="Your demo identity: anon-7c42">
            7C
          </span>
        </div>
      </nav>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>
            <span className="brand-period">~/</span>workspace
          </span>
          <span className="beta">LOCAL</span>
        </div>
        <div className="sidebar-content">
          <button
            className="discover-button"
            onClick={() => change({ kind: "discover", id: "" })}
          >
            <Icon name="compass" /> Browse directory
            <Icon name="chevron" size={16} />
          </button>
          <div className="section-heading">
            <span>
              rooms/ <span className="count">{joined.length}</span>
            </span>
            <button
              className="icon-button"
              aria-label="Create a room"
              onClick={() => {
                setTopic("");
                setModal("create");
              }}
            >
              <Icon name="plus" size={17} />
            </button>
          </div>
          {roomLinks}
          <div className="section-heading dm-heading">
            <span>private/</span>
            <button
              className="icon-button"
              aria-label="New direct message"
              onClick={() => setModal("dm")}
            >
              <Icon name="plus" size={17} />
            </button>
          </div>
          {dmLinks}
          <div className="sidebar-note">
            <p>
              no profiles.
              <br />
              no followers.
              <br />
              <strong>just a conversation_</strong>
            </p>
          </div>
        </div>
        <div className="your-identity">
          <Avatar person={me} small />
          <span>
            <strong>
              anon-7c42 <span>YOU</span>
            </strong>
            <small>session · anonymous</small>
          </span>
        </div>
      </aside>
      <main className="conversation">
        <header className="chat-header">
          <div className="header-room-icon">
            <Icon
              name={
                view.kind === "discover"
                  ? "compass"
                  : room
                    ? "rooms"
                    : "message"
              }
              size={23}
            />
          </div>
          <div>
            <h1>
              {view.kind === "discover"
                ? "/explore"
                : room
                  ? room.id.slice(0, 8)
                  : alias(view.id)}
              {room && (
                <>
                  <span className="header-divider">/</span>
                  <span>{room.topic}</span>
                </>
              )}
            </h1>
            <p>
              {view.kind === "discover"
                ? "Public room directory"
                : room
                  ? room.topic
                  : "Direct conversation · anonymous"}
            </p>
          </div>
          {view.kind !== "discover" && (
            <div className="header-actions">
              <span>
                <Icon name="users" size={17} />
                {room?.members.length || 2}
              </span>
              <button
                className="icon-button"
                aria-label="Conversation details"
                onClick={() => setModal("details")}
              >
                <Icon name="info" />
              </button>
            </div>
          )}
        </header>
        <div className="demo-strip">
          <span className="demo-label">[ demo ]</span>
          <span>
            Simulated people and replies. Messages disappear when you refresh.
          </span>
        </div>
        {view.kind === "discover" ? (
          <div className="discovery">
            <span className="eyebrow">DRIFT / PUBLIC DIRECTORY</span>
            <h2>Find a frequency.</h2>
            <p>Open a room. Pick up a thread. Stay as long as you like.</p>
            <div className="discovery-tools">
              <label className="search-box">
                <Icon name="search" size={19} />
                <input
                  aria-label="Search rooms by topic or UUID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search a topic or paste a room UUID"
                />
              </label>
              <button
                className="primary"
                onClick={() => {
                  const pool = rooms.filter((r) => !r.joined);
                  const options = pool.length ? pool : rooms;
                  join(options[Math.floor(Math.random() * options.length)].id);
                }}
              >
                <Icon name="shuffle" size={17} />
                Surprise me
              </button>
            </div>
            <div className="discovery-heading">
              <span>
                {
                  rooms.filter((r) =>
                    `${r.topic} ${r.id} ${r.category}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  ).length
                }{" "}
                rooms available
              </span>
              {createButton}
            </div>
            <div className="discovery-grid">
              {rooms
                .filter((r) =>
                  `${r.topic} ${r.id} ${r.category}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((r) => (
                  <article className="discovery-card" key={r.id}>
                    <div className="card-top">
                      <Icon name="rooms" />
                      <span>{r.members.length} people · simulated</span>
                    </div>
                    <span className="eyebrow">{r.category}</span>
                    <h3>{r.topic}</h3>
                    <code>{r.id}</code>
                    <p>
                      {r.messages.at(-1)?.text ||
                        "A blank page. Start something good."}
                    </p>
                    <button onClick={() => join(r.id)}>
                      {r.joined ? "Return to room" : "Join conversation"}
                      <Icon name="arrow" size={17} />
                    </button>
                  </article>
                ))}
            </div>
            {!rooms.some((r) =>
              `${r.topic} ${r.id} ${r.category}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            ) && (
              <div className="empty-state">
                <h3>No rooms found.</h3>
                <p>Try another topic or create a room of your own.</p>
                {createButton}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="message-scroll" ref={scroll}>
              <section className="room-welcome">
                <span className="eyebrow">
                  {room ? "ROOM SESSION" : "PRIVATE SESSION"}{" "}
                  <span className="session-dot">●</span>
                </span>
                <h2>{room ? room.topic : alias(view.id)}</h2>
                <code>
                  {room
                    ? `/rooms/${room.id}`
                    : `/private/${view.id.toLowerCase()}`}
                </code>
                <p>
                  <span className="system-prefix">sys &gt;</span>{" "}
                  {room
                    ? "You joined the room. Say something, or just listen."
                    : "A direct conversation. Only you and this simulated participant."}
                </p>
              </section>
              <div className="day-divider">
                <span />
                session log · today
                <span />
              </div>
              <div
                className="messages"
                role="log"
                aria-label="Conversation messages"
                aria-live="polite"
              >
                {messages.map((m) => (
                  <article
                    className={`message ${m.author === me.id ? "own" : ""}`}
                    key={m.id}
                  >
                    <button
                      className="avatar-button"
                      disabled={m.author === me.id}
                      onClick={() => dm(m.author)}
                      aria-label={`Message ${alias(m.author)}`}
                    >
                      <Avatar person={person(m.author)} />
                    </button>
                    <div className="message-content">
                      <div className="message-meta">
                        <button
                          className={`author-name name-${person(m.author).color}`}
                          disabled={m.author === me.id}
                          onClick={() => dm(m.author)}
                          aria-label={`Direct message ${alias(m.author)}`}
                        >
                          {alias(m.author)}
                        </button>
                        {m.author === me.id && (
                          <span className="you-label">YOU</span>
                        )}
                        <time>{m.time}</time>
                      </div>
                      <p>{m.text}</p>
                      {m.reactions && (
                        <div className="reactions">
                          {m.reactions.map((r) => (
                            <button
                              key={r.emoji}
                              aria-label={`React ${r.emoji}`}
                              aria-pressed={!!r.mine}
                              onClick={() =>
                                update((ms) =>
                                  ms.map((item) =>
                                    item.id === m.id
                                      ? {
                                          ...item,
                                          reactions: item.reactions?.map(
                                            (reaction) =>
                                              reaction.emoji === r.emoji
                                                ? {
                                                    ...reaction,
                                                    mine: !reaction.mine,
                                                    count:
                                                      reaction.count +
                                                      (reaction.mine ? -1 : 1),
                                                  }
                                                : reaction,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              {r.emoji}
                              <span>{r.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                {!messages.length && (
                  <p className="empty-state">The first word is yours.</p>
                )}
              </div>
            </div>
            <div className="composer-wrap">
              <div className="typing-placeholder" role="status">
                {typing[key] > 0 ? "Someone is typing… (simulated)" : ""}
              </div>
              {emoji && (
                <div className="emoji-picker" aria-label="Choose an emoji">
                  {["👋", "🙂", "☕", "✨", "❤️", "🌱"].map((e) => (
                    <button
                      key={e}
                      aria-label={`Insert ${e}`}
                      onClick={() => {
                        setDrafts((ds) => ({
                          ...ds,
                          [key]: (ds[key] || "") + e,
                        }));
                        setEmoji(false);
                        input.current?.focus();
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <form className="composer" onSubmit={send}>
                <span className="prompt-user">{alias(me.id)}</span>
                <span className="prompt-symbol" aria-hidden="true">
                  ❯
                </span>
                <input
                  ref={input}
                  aria-label="Message"
                  value={draft}
                  onChange={(e) =>
                    setDrafts((ds) => ({ ...ds, [key]: e.target.value }))
                  }
                  placeholder={
                    room
                      ? `Say something in #${room.id.slice(0, 8)}…`
                      : `Message ${alias(view.id)}…`
                  }
                  maxLength={2000}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Add emoji"
                  aria-expanded={emoji}
                  onClick={() => setEmoji(!emoji)}
                >
                  <Icon name="smile" />
                </button>
                <button
                  className="send-button"
                  aria-label="Send message"
                  disabled={!draft.trim()}
                >
                  <Icon name="send" size={19} />
                </button>
              </form>
              <div className="composer-footer">
                <span>plain text · be kind to strangers</span>
                <span>
                  <kbd>Enter</kbd> to send
                </span>
              </div>
            </div>
          </>
        )}
      </main>
      <footer className="status-bar">
        <span>
          <span className="status-block">DRIFT</span> anonymous session
        </span>
        <span>
          {view.kind === "discover"
            ? `${rooms.length} rooms`
            : `${messages.length} messages`}
          <span className="status-secondary"> · local simulation · v0.2</span>
        </span>
        <button
          onClick={() => {
            setCommand("");
            setModal("command");
          }}
        >
          ⌘ / Ctrl K <span className="status-secondary">commands</span>
        </button>
      </footer>
      {modal && (
        <Modal
          title={
            {
              command: "Command palette",
              create: "Create a room",
              dm: "Start a conversation",
              rooms: "Your rooms",
              details: room ? "Room details" : "Conversation details",
              reset: "Start fresh?",
            }[modal]
          }
          close={() => setModal(null)}
        >
          {modal === "command" ? (
            <>
              <label className="field command-field">
                Jump to a room, person, or action
                <input
                  autoFocus
                  aria-label="Filter commands"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Type to filter…"
                />
              </label>
              <div className="command-list">
                {(!command ||
                  "explore browse rooms".includes(command.toLowerCase())) && (
                  <button onClick={() => change({ kind: "discover", id: "" })}>
                    <span>→ explore</span>
                    <small>browse public rooms</small>
                  </button>
                )}
                {(!command ||
                  "create new room".includes(command.toLowerCase())) && (
                  <button
                    onClick={() => {
                      setTopic("");
                      setModal("create");
                    }}
                  >
                    <span>+ new room</span>
                    <small>generate a UUID</small>
                  </button>
                )}
                {rooms
                  .filter((r) =>
                    `${r.id} ${r.topic}`
                      .toLowerCase()
                      .includes(command.toLowerCase()),
                  )
                  .map((r) => (
                    <button key={r.id} onClick={() => join(r.id)}>
                      <span>#{r.id.slice(0, 8)}</span>
                      <small>{r.topic}</small>
                    </button>
                  ))}
                {people
                  .filter(
                    (p) =>
                      p.id !== me.id &&
                      alias(p.id).includes(command.toLowerCase()),
                  )
                  .map((p) => (
                    <button key={p.id} onClick={() => dm(p.id)}>
                      <span>@{alias(p.id)}</span>
                      <small>direct message</small>
                    </button>
                  ))}
                {command &&
                  !rooms.some((r) =>
                    `${r.id} ${r.topic}`
                      .toLowerCase()
                      .includes(command.toLowerCase()),
                  ) &&
                  !people.some(
                    (p) =>
                      p.id !== me.id &&
                      alias(p.id).includes(command.toLowerCase()),
                  ) &&
                  !["explore browse rooms", "create new room"].some((a) =>
                    a.includes(command.toLowerCase()),
                  ) && (
                    <p>No matches. Try a topic, UUID, or anonymous alias.</p>
                  )}
              </div>
              <p className="form-note">
                Tab to navigate · Enter to open · Esc to close
              </p>
            </>
          ) : modal === "create" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const id = crypto.randomUUID();
                setRooms((rs) => [
                  ...rs,
                  {
                    id,
                    topic: topic.trim() || "An open conversation",
                    category: "NEW CONVERSATIONS",
                    members: [me.id],
                    messages: [],
                    joined: true,
                  },
                ]);
                change({ kind: "room", id });
                setToast("Room created. You have the first word.");
              }}
            >
              <p>
                A fresh UUID, a blank page. Give people something to talk about.
              </p>
              <label className="field">
                Conversation topic <span>(optional)</span>
                <input
                  autoFocus
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={60}
                  placeholder="What’s on your mind?"
                />
              </label>
              <p className="form-note">
                This room exists only in your demo tab.
              </p>
              <button className="primary" type="submit">
                Create room
                <Icon name="arrow" size={17} />
              </button>
            </form>
          ) : modal === "dm" ? (
            <>
              <p>
                Choose a simulated participant. No profiles, no introductions
                required.
              </p>
              {people
                .filter((p) => p.id !== me.id)
                .map((p) => (
                  <button
                    className="member modal-member"
                    key={p.id}
                    onClick={() => dm(p.id)}
                  >
                    <Avatar person={p} />
                    <span>
                      <strong>{alias(p.id)}</strong>
                      <span>{p.note}</span>
                    </span>
                    <Icon name="arrow" size={18} />
                  </button>
                ))}
            </>
          ) : modal === "rooms" ? (
            <>
              {roomLinks}
              <div className="modal-actions">
                {createButton}
                <button
                  className="secondary"
                  onClick={() => change({ kind: "discover", id: "" })}
                >
                  Discover rooms
                </button>
              </div>
            </>
          ) : modal === "details" ? (
            details
          ) : (
            <>
              <p>
                This clears your messages and created rooms, and restores the
                seeded conversations.
              </p>
              <div className="modal-actions">
                <button className="secondary" onClick={() => setModal(null)}>
                  Keep chatting
                </button>
                <button className="primary" onClick={reset}>
                  Reset demo
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="info" size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
