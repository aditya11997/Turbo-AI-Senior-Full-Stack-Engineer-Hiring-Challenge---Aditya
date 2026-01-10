"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";
import styles from "../../styles/notes.module.css";

type NotesSummary = {
  has_notes: boolean;
  total_notes: number;
  default_category: string;
  categories: { name: string; color_hex: string; count: number }[];
};

type Note = {
  id: number;
  title: string;
  content: string;
  category: { name: string; color_hex: string };
  created_at: string;
  updated_at: string;
};

const DEFAULT_TITLE = "Note Title";
const DEFAULT_CONTENT = "Pour your heart out...";

const CATEGORY_THEME: Record<string, { dot: string; bg: string }> = {
  "Random Thoughts": { dot: "#EF9C66", bg: "#F9C9A7" },
  School: { dot: "#FCDC94", bg: "#FBE7B2" },
  Personal: { dot: "#78ABA8", bg: "#C9DED7" },
  Drama: { dot: "#C8CFA0", bg: "#E4E8C9" }
};

const isRealNote = (note: Note) =>
  note.title !== DEFAULT_TITLE || note.content !== DEFAULT_CONTENT;

const formatNoteDate = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000
  );

  if (diffDays === 0) {
    return "today";
  }
  if (diffDays === 1) {
    return "yesterday";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date);
};

export default function NotesPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<NotesSummary | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.get<NotesSummary>("/notes/summary"), api.get<Note[]>("/notes")])
      .then(([summaryData, notesData]) => {
        if (!isMounted) {
          return;
        }
        setSummary(summaryData);
        setNotes(notesData.filter(isRealNote));
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateNote = async () => {
    setCreateError(null);
    setIsCreating(true);
    try {
      router.push("/notes/new");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Unable to create note."
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.notesContainer}>
        <div className={styles.layout}>
          <div className={styles.sidebarHeader}>All Categories</div>
          <div className={styles.mainHeader}>
            <button
              className={styles.newNoteButton}
              onClick={handleCreateNote}
              disabled={isCreating}
            >
              <img
                className={styles.newNoteIcon}
                src="/assets/plus.png"
                alt=""
                aria-hidden="true"
              />
              <span>New Note</span>
              {isCreating ? <span className={styles.spinner} /> : null}
            </button>
            {createError ? <p className={styles.error}>{createError}</p> : null}
          </div>

          <aside className={styles.sidebar}>
            {summary?.categories.map((category) => (
              <div className={styles.categoryItem} key={category.name}>
                <div className={styles.categoryLeft}>
                  <span
                    className={styles.dot}
                    style={{ background: category.color_hex }}
                  />
                  <span>{category.name}</span>
                </div>
                <span>{category.count}</span>
              </div>
            ))}
          </aside>

          <section className={styles.main}>
            {!summary?.has_notes ? (
              <div className={styles.emptyState}>
                <img
                  className={styles.emptyImage}
                  src="/assets/empty_state.png"
                  alt=""
                  aria-hidden="true"
                />
                <p className={styles.emptyText}>
                  I&apos;m just here waiting for your charming notes...
                </p>
              </div>
            ) : (
              <div className={styles.notesGrid}>
                {notes.map((note) => {
                  const theme =
                    CATEGORY_THEME[note.category?.name] ||
                    CATEGORY_THEME["Random Thoughts"];
                  const dateLabel = formatNoteDate(note.updated_at);
                  return (
                    <button
                      key={note.id}
                      type="button"
                      className={styles.noteCard}
                      onClick={() => router.push(`/notes/${note.id}`)}
                      style={{ borderColor: theme.dot, backgroundColor: theme.bg }}
                    >
                      <div className={styles.noteContent}>
                        <div className={styles.noteHeader}>
                          <span className={styles.noteHeaderDate}>
                            {dateLabel}
                          </span>
                          <span>·</span>
                          <span className={styles.noteHeaderCategory}>
                            {note.category?.name}
                          </span>
                        </div>
                        <h3 className={styles.noteTitle}>{note.title}</h3>
                        <p className={styles.noteBody}>{note.content}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
