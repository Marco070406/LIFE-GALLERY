import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createMemory, deleteMemory, fetchMemories, verifyAdminCode, type Memory } from '../lib/memories';
import { Lightbox } from './Lightbox';

const AUTHOR_KEY = 'life-gallery:author';
const CODE_KEY = 'life-gallery:family-code';
const ADMIN_KEY = 'life-gallery:admin-code';
const MAX_MESSAGE = 1000;

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// Préférences du visiteur (prénom, code) : simple confort, la page fonctionne sans.
function readPref(key: string): string {
  try { return localStorage.getItem(key) ?? ''; } catch { return ''; }
}
function writePref(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* stockage indisponible */ }
}

// Code administrateur : gardé seulement le temps de l'onglet (sessionStorage).
function readAdminCode(): string | null {
  try { return sessionStorage.getItem(ADMIN_KEY); } catch { return null; }
}
function writeAdminCode(code: string | null) {
  try {
    if (code) sessionStorage.setItem(ADMIN_KEY, code);
    else sessionStorage.removeItem(ADMIN_KEY);
  } catch { /* stockage indisponible */ }
}

// ── Accès administrateur (bas de section) ──────────────────────────────────
interface AdminBarProps {
  adminCode: string | null;
  onLogin: (code: string) => void;
  onLogout: () => void;
}

function AdminBar({ adminCode, onLogin, onLogout }: AdminBarProps) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (adminCode) {
    return (
      <div className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 text-gold px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden="true" />
          Mode administrateur
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="underline underline-offset-4 opacity-70 hover:opacity-100 cursor-pointer"
        >
          Quitter
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-14 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs underline underline-offset-4 opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
        >
          Administration
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setError(null);
    try {
      await verifyAdminCode(code.trim());
      onLogin(code.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vérification impossible.');
      setChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-14 mx-auto max-w-sm text-center space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium">Code administrateur</label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          autoFocus
          disabled={checking}
          className="flex-1 min-w-0 rounded-full border border-current/25 bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
        <button
          type="submit"
          disabled={checking}
          className="btn-chapter rounded-full border border-current/40 px-5 py-2.5 text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {checking ? '…' : 'Valider'}
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={() => { setOpen(false); setCode(''); setError(null); }}
        className="text-xs underline underline-offset-4 opacity-50 hover:opacity-80 cursor-pointer"
      >
        Annuler
      </button>
    </form>
  );
}

// ── Formulaire d'ajout ─────────────────────────────────────────────────────
interface MemoryFormProps {
  chapterId: string;
  chapterTitle: string;
  onClose: () => void;
  onCreated: (memory: Memory) => void;
}

function MemoryForm({ chapterId, chapterTitle, onClose, onCreated }: MemoryFormProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [author, setAuthor] = useState(() => readPref(AUTHOR_KEY));
  const [message, setMessage] = useState('');
  const [code, setCode] = useState(() => readPref(CODE_KEY));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Libère l'URL d'aperçu quand elle change ou à la fermeture
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Focus initial, verrouillage du scroll, restauration du focus
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, []);

  // Échap pour fermer + piège à focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) onClose();
      else if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, sending]);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choisissez un fichier image.');
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) { setError('Choisissez une photo.'); return; }
    if (!author.trim()) { setError('Indiquez votre prénom.'); return; }
    if (!code.trim()) { setError('Saisissez le code famille.'); return; }

    setSending(true);
    setError(null);
    try {
      const memory = await createMemory({ chapterId, author: author.trim(), message: message.trim(), code: code.trim(), photo });
      writePref(AUTHOR_KEY, author.trim());
      writePref(CODE_KEY, code.trim());
      onCreated(memory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'envoi a échoué.");
      setSending(false);
    }
  };

  const fieldClass = `w-full rounded-md border border-ink/15 bg-white/70 px-4 py-3 text-base text-ink placeholder:text-ink/40
    focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition`;

  return (
    <div
      className="fixed inset-0 z-[100] bg-night/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={() => { if (!sending) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="section-light w-full sm:max-w-lg max-h-[92svh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5" noValidate>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow eyebrow-left text-gold mb-2">{chapterTitle}</p>
              <h3 id={titleId} className="font-display text-3xl font-light">Partager un souvenir</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="w-10 h-10 shrink-0 rounded-full border border-ink/15 flex items-center justify-center hover:bg-ink/5 transition cursor-pointer disabled:opacity-40"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Photo */}
          <div>
            <input
              ref={fileInputRef}
              id={`${titleId}-photo`}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={sending}
            />
            <label
              htmlFor={`${titleId}-photo`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              className="block cursor-pointer rounded-lg border-2 border-dashed border-ink/20 hover:border-gold transition-colors overflow-hidden"
            >
              {preview ? (
                <span className="relative block">
                  <img src={preview} alt="Aperçu de la photo choisie" className="w-full max-h-72 object-contain bg-mist" />
                  <span className="absolute bottom-2 right-2 rounded-full bg-night/80 text-paper text-xs px-3 py-1.5">
                    Changer de photo
                  </span>
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V18a2 2 0 002 2h14a2 2 0 002-2v-1.5M7.5 9L12 4.5 16.5 9M12 4.5V15" />
                  </svg>
                  <span className="font-medium">Choisir une photo</span>
                  <span className="text-sm opacity-60">ou la glisser ici</span>
                </span>
              )}
            </label>
          </div>

          {/* Message */}
          <div>
            <label htmlFor={`${titleId}-message`} className="block text-sm font-medium mb-1.5">
              Votre message <span className="opacity-50 font-normal">(facultatif)</span>
            </label>
            <textarea
              id={`${titleId}-message`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE}
              rows={3}
              placeholder="Un souvenir, une anecdote, un mot doux…"
              className={`${fieldClass} resize-y min-h-24`}
              disabled={sending}
            />
            <p className="text-xs opacity-50 text-right mt-1">{message.length} / {MAX_MESSAGE}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label htmlFor={`${titleId}-author`} className="block text-sm font-medium mb-1.5">Votre prénom</label>
              <input
                id={`${titleId}-author`}
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={60}
                autoComplete="given-name"
                placeholder="Ex. Tata Rose"
                className={fieldClass}
                disabled={sending}
              />
            </div>
            {/* Code famille */}
            <div>
              <label htmlFor={`${titleId}-code`} className="block text-sm font-medium mb-1.5">Code famille</label>
              <input
                id={`${titleId}-code`}
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                className={fieldClass}
                disabled={sending}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper rounded-full text-sm font-medium tracking-wide
              hover:bg-night disabled:opacity-60 disabled:cursor-wait transition cursor-pointer
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {sending && (
              <span className="w-4 h-4 rounded-full border-2 border-paper/30 border-t-paper animate-spin" aria-hidden="true" />
            )}
            {sending ? 'Envoi en cours…' : 'Partager le souvenir'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Section « Souvenirs de la famille » ─────────────────────────────────────
interface FamilyMemoriesProps {
  chapterId: string;
  chapterTitle: string;
}

export function FamilyMemories({ chapterId, chapterTitle }: FamilyMemoriesProps) {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState<string | null>(() => readAdminCode());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchMemories(chapterId, controller.signal)
      .then(setMemories)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setLoadError(err instanceof Error ? err.message : 'Impossible de charger les souvenirs.');
        setMemories([]);
      });
    return () => controller.abort();
  }, [chapterId]);

  const handleCreated = useCallback((memory: Memory) => {
    setMemories((list) => [memory, ...(list ?? [])]);
    setLoadError(null);
    setJustAdded(memory.id);
    setFormOpen(false);
  }, []);

  const handleAdminLogin = useCallback((code: string) => {
    writeAdminCode(code);
    setAdminCode(code);
  }, []);
  const handleAdminLogout = useCallback(() => {
    writeAdminCode(null);
    setAdminCode(null);
    setDeleteError(null);
  }, []);

  const handleDelete = async (memory: Memory) => {
    if (!adminCode) return;
    const label = memory.message ? `« ${memory.message.slice(0, 60)}${memory.message.length > 60 ? '…' : ''} »` : 'cette photo';
    if (!window.confirm(`Supprimer définitivement le souvenir de ${memory.author} (${label}) ?`)) return;

    setDeletingId(memory.id);
    setDeleteError(null);
    try {
      await deleteMemory(memory.id, adminCode);
      setMemories((list) => (list ?? []).filter((m) => m.id !== memory.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'La suppression a échoué.';
      setDeleteError({ id: memory.id, message });
      if (/administrateur incorrect|trop de codes/i.test(message)) handleAdminLogout();
    } finally {
      setDeletingId(null);
    }
  };

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const count = memories?.length ?? 0;
  const prevPhoto = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback(() => setLightboxIndex((i) => (i !== null && i < count - 1 ? i + 1 : i)), [count]);

  return (
    <section aria-labelledby={`${chapterId}-family`} className="border-t border-current/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow eyebrow-left text-gold mb-4">Souvenirs de la famille</p>
            <h2 id={`${chapterId}-family`} className="font-display text-4xl md:text-5xl font-light mb-3">
              Vos photos, vos mots
            </h2>
            <p className="font-light opacity-70 max-w-md">
              Une photo de cette période ? Partagez-la avec un petit message pour l'ajouter à l'album.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="btn-chapter self-start md:self-auto inline-flex items-center gap-2 px-8 py-3.5 border border-current/40 rounded-full text-sm font-medium tracking-wide cursor-pointer
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un souvenir
          </button>
        </div>

        {memories === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true" aria-label="Chargement des souvenirs">
            {[0, 1, 2].map((i) => (
              <div key={i} className="photo-print">
                <div className="aspect-[4/5] bg-current/10 animate-pulse rounded-[2px]" />
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-current/20 py-14 px-6 text-center">
            <p className="font-display italic text-2xl font-light mb-2">
              {loadError ? 'Les souvenirs ne sont pas disponibles pour le moment.' : 'Aucun souvenir pour l’instant.'}
            </p>
            <p className="text-sm opacity-60">
              {loadError ?? 'Soyez le premier à partager une photo de ce chapitre.'}
            </p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {memories.map((memory, i) => (
              <li key={memory.id} className={justAdded === memory.id ? 'animate-fade-in-simple' : undefined}>
                <figure>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="group block w-full cursor-zoom-in rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                    aria-label={`Agrandir la photo de ${memory.author}`}
                  >
                    <span className="photo-print block transition-transform duration-500 ease-out group-hover:-translate-y-1">
                      <span className="block overflow-hidden rounded-[2px] aspect-[4/5] bg-current/10">
                        <img
                          src={memory.src}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                      </span>
                    </span>
                  </button>
                  <figcaption className="mt-4 space-y-2">
                    {memory.message && (
                      <p className="font-display italic text-lg font-light leading-snug whitespace-pre-line">
                        « {memory.message} »
                      </p>
                    )}
                    <p className="text-sm opacity-60">
                      <span className="text-gold">—</span> {memory.author}
                      <span aria-hidden="true"> · </span>
                      <time dateTime={memory.createdAt}>{dateFormat.format(new Date(memory.createdAt))}</time>
                    </p>
                    {adminCode && (
                      <button
                        type="button"
                        onClick={() => handleDelete(memory)}
                        disabled={deletingId === memory.id}
                        className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3" />
                        </svg>
                        {deletingId === memory.id ? 'Suppression…' : 'Supprimer'}
                        <span className="sr-only"> le souvenir de {memory.author}</span>
                      </button>
                    )}
                    {deleteError?.id === memory.id && (
                      <p role="alert" className="text-sm text-red-500">{deleteError.message}</p>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}

        {!loadError && (
          <AdminBar adminCode={adminCode} onLogin={handleAdminLogin} onLogout={handleAdminLogout} />
        )}
      </div>

      {formOpen && (
        <MemoryForm
          chapterId={chapterId}
          chapterTitle={chapterTitle}
          onClose={closeForm}
          onCreated={handleCreated}
        />
      )}

      {lightboxIndex !== null && memories && (
        <Lightbox
          images={memories.map((m) => ({
            src: m.src,
            caption: m.message ? `« ${m.message} » — ${m.author}` : `Photo de ${m.author}`,
          }))}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </section>
  );
}
