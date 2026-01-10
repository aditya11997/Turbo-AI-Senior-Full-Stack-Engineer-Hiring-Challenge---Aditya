"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { api } from "../../../lib/api";
import styles from "../../../styles/noteEditor.module.css";

type Category = { name: string; color_hex: string };

type NoteResponse = {
  id: number;
  title: string;
  content: string;
  category: Category;
  created_at: string;
  updated_at: string;
};

const CATEGORY_THEME: Record<
  string,
  { dot: string; bg: string }
> = {
  "Random Thoughts": { dot: "#EF9C66", bg: "#F9C9A7" },
  School: { dot: "#FCDC94", bg: "#FBE7B2" },
  Personal: { dot: "#78ABA8", bg: "#C9DED7" },
  Drama: { dot: "#C8CFA0", bg: "#E4E8C9" }
};

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const noteId = params?.id ?? "";
  const isNewNote = noteId === "new";

  const [note, setNote] = useState<NoteResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryName, setCategoryName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  const saveTimerRef = useRef<number | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<{
    title: string;
    content: string;
    categoryName: string;
  } | null>(null);

  const clearSaveTimer = () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  };

  const hasMeaningfulChange = () => {
    const last = lastSavedRef.current;
    if (!last) {
      return true;
    }
    return (
      last.title !== title ||
      last.content !== content ||
      last.categoryName !== categoryName
    );
  };

  async function saveNow() {
    if (!lastSavedRef.current) {
      return;
    }
    if (isSavingRef.current) {
      return;
    }
    if (!hasMeaningfulChange()) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");
    try {
      let updated: NoteResponse;
      if (!note && isNewNote) {
        updated = await api.post<NoteResponse>("/notes", {
          title,
          content,
          category_name: categoryName || "Random Thoughts"
        });
        router.replace(`/notes/${updated.id}`);
      } else if (note) {
        updated = await api.patch<NoteResponse>(`/notes/${note.id}`, {
          title,
          content,
          category_name: categoryName
        });
      } else {
        return;
      }

      setNote(updated);
      lastSavedRef.current = {
        title: updated.title ?? "",
        content: updated.content ?? "",
        categoryName: updated.category?.name ?? categoryName
      };
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1200);
    } catch {
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }

  const scheduleSave = () => {
    clearSaveTimer();
    saveTimerRef.current = window.setTimeout(() => {
      saveNow();
    }, 600);
  };

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const categoryData = await api.get<Category[]>(`/categories`);

        if (!mounted) {
          return;
        }

        setCategories(categoryData);

        if (isNewNote) {
          const defaultCategory = categoryData[0]?.name || "Random Thoughts";
          setNote(null);
          setTitle("Note Title");
          setContent("Pour your heart out...");
          setCategoryName(defaultCategory);
          lastSavedRef.current = {
            title: "Note Title",
            content: "Pour your heart out...",
            categoryName: defaultCategory
          };
        } else {
          const noteData = await api.get<NoteResponse>(`/notes/${noteId}`);
          if (!mounted) {
            return;
          }
          setNote(noteData);
          setTitle(noteData.title ?? "");
          setContent(noteData.content ?? "");
          setCategoryName(noteData.category?.name ?? "");
          lastSavedRef.current = {
            title: noteData.title ?? "",
            content: noteData.content ?? "",
            categoryName: noteData.category?.name ?? ""
          };
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Unable to load note.");
      } finally {
        if (!mounted) {
          return;
        }
        setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [noteId, isNewNote]);

  const lastEditedLabel = useMemo(() => {
    if (!note?.updated_at) {
      return "";
    }
    const date = new Date(note.updated_at);

    const datePart = new Intl.DateTimeFormat(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);

    const timePart = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
      .format(date)
      .replace(" AM", "am")
      .replace(" PM", "pm")
      .replace(" am", "am")
      .replace(" pm", "pm");

    return `Last Edited: ${datePart} at ${timePart}`;
  }, [note?.updated_at]);

  const activeTheme =
    CATEGORY_THEME[categoryName] || CATEGORY_THEME["Random Thoughts"];

  useEffect(() => {
    if (!note && !isNewNote) {
      return;
    }
    if (!lastSavedRef.current) {
      return;
    }
    scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, categoryName]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  if (isLoading) {
    return null;
  }

  if (loadError) {
    return (
      <main className={styles.page}>
        <div className={styles.errorBox}>{loadError}</div>
      </main>
    );
  }

  if (!note && !isNewNote) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.editorContainer}>
        <div className={styles.topRow}>
          <div className={styles.categoryWrap} ref={dropdownRef}>
            <button
              type="button"
              className={styles.categoryButton}
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <span className={styles.categoryButtonLeft}>
                <span
                  className={styles.categoryDot}
                  style={{ backgroundColor: activeTheme.dot }}
                />
              <span className={styles.categoryLabel}>
                {categoryName || "Random Thoughts"}
              </span>
            </span>
              <span className={styles.chevronButton} aria-hidden="true">
                <svg
                  className={`${styles.chevronIcon} ${
                    isDropdownOpen ? styles.chevronOpen : ""
                  }`}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            {isDropdownOpen ? (
              <div className={styles.dropdownMenu}>
                {categories.map((category) => {
                  const theme = CATEGORY_THEME[category.name];
                  return (
                    <button
                      key={category.name}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setCategoryName(category.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span
                        className={styles.dropdownDot}
                        style={{
                          backgroundColor: theme?.dot ?? category.color_hex
                        }}
                      />
                      <span className={styles.dropdownLabel}>
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            className={styles.closeButton}
            onClick={async () => {
              clearSaveTimer();
              await saveNow();
              router.push("/notes");
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <section
          className={styles.card}
          style={{
            backgroundColor: activeTheme.bg,
            borderColor: activeTheme.dot
          }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.lastEditedRow}>
              <div className={styles.lastEdited}>{lastEditedLabel}</div>
              {saveStatus === "saving" ? (
                <div className={styles.saveHint}>Saving…</div>
              ) : null}
              {saveStatus === "saved" ? (
                <div className={styles.saveHint}>Saved</div>
              ) : null}
              {saveStatus === "error" ? (
                <div className={styles.saveError}>Couldn’t save</div>
              ) : null}
            </div>
          </div>

          <textarea
            ref={titleRef}
            className={styles.titleInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note Title"
            rows={1}
          />

          <textarea
            className={styles.bodyInput}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Pour your heart out..."
          />
        </section>
      </div>
    </main>
  );
}
