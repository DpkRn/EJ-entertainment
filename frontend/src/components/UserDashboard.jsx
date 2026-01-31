import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useVisitor } from '../context/VisitorContext';
import DiscussPage from './DiscussPage';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const incognitoShortcut = isMac ? '⌘⇧N' : 'Ctrl+Shift+N';
const pasteShortcut = isMac ? '⌘V' : 'Ctrl+V';

function LinkCard({ link, onIncognito, onOpenDiscuss, onUpdateLink }) {
  const id = link._id;
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const cardRef = useRef(null);
  const fetchedRef = useRef(false);

  const likes = link.likes ?? 0;
  const views = link.views ?? 0;
  const replies = link.replies ?? 0;

  // Lazy-load preview when card enters viewport (no view count here)
  useEffect(() => {
    const el = cardRef.current;
    if (!el || fetchedRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || fetchedRef.current) return;
        fetchedRef.current = true;
        setPreviewLoading(true);
        const url = `/api/visitor/preview?url=${encodeURIComponent(link.url)}`;
        try {
          const res = await fetch(url);
          const data = res.ok ? await res.json() : null;
          if (data?.title || data?.description || data?.image) {
            setPreview(data);
          }
        } catch (_) {}
        finally {
          setPreviewLoading(false);
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [link.url, id]);

  // Increment view when link is opened, copied, or used for incognito
  const recordView = useCallback(() => {
    (async () => {
      try {
        const res = await fetch(`/api/visitor/links/${id}/view`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          onUpdateLink?.(id, data);
        }
      } catch (_) {}
    })();
  }, [id, onUpdateLink]);

  const handleLinkClick = recordView;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link.url).then(() => {
      recordView();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleIncognito = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link.url).then(() => {
      recordView();
      onIncognito();
    });
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    try {
      const res = await fetch(`/api/visitor/links/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        onUpdateLink?.(id, data);
      } else {
        setLiked(false);
      }
    } catch (_) {
      setLiked(false);
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenDiscuss?.(id);
  };

  const displayText = link.label || link.url;
  const showUrl = link.label && link.url !== link.label;

  return (
    <li className="link-card" ref={cardRef}>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="link-card__anchor"
        title={link.url}
        onClick={handleLinkClick}
      >
        {(previewLoading || preview?.image) && (
          <div className="link-card__preview">
            {previewLoading ? (
              <div className="link-card__preview-placeholder" aria-hidden />
            ) : preview?.image ? (
              <img
                src={preview.image}
                alt=""
                className="link-card__preview-img"
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
        )}
        <div className="link-card__body">
          <span className="link-card__icon" aria-hidden>↗</span>
          <span className="link-card__label">{displayText}</span>
          {preview?.title && preview.title !== displayText && (
            <span className="link-card__preview-title">{preview.title}</span>
          )}
          {preview?.description && (
            <span className="link-card__preview-desc">{preview.description}</span>
          )}
          {showUrl && !preview?.description && (
            <span className="link-card__url">{link.url}</span>
          )}
          <div className="link-card__meta">
            <button
              type="button"
              className={`link-card__like ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? 'Liked' : 'Like'}
            >
              <span className="link-card__like-icon">{liked ? '♥' : '♡'}</span>
              <span>{likes}</span>
            </button>
            <span className="link-card__views" title="Views">
              <span className="link-card__views-icon">👁</span>
              <span>{views}</span>
            </span>
            <button
              type="button"
              className="link-card__reply-meta"
              onClick={handleReply}
              aria-label="Open discussion"
            >
              <span className="link-card__reply-meta-icon">💬</span>
              Reply {replies > 0 && <span className="link-card__reply-count">({replies})</span>}
            </button>
          </div>
        </div>
      </a>
      <div className="link-card__actions">
        <button
          type="button"
          className="link-card__incognito"
          onClick={handleIncognito}
          title={`Copy URL and open in Incognito (${incognitoShortcut}, then ${pasteShortcut})`}
          aria-label="Copy for Incognito"
        >
          Incognito
        </button>
        <button
          type="button"
          className={`link-card__copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy URL"
          aria-label={copied ? 'Copied!' : 'Copy URL'}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </li>
  );
}

export default function UserDashboard() {
  const { categories, links, selectedCategoryId, setSelectedCategoryId, loading, error, updateLink } = useApp();
  const { visitor, logout } = useVisitor();
  const [search, setSearch] = useState('');
  const [incognitoToast, setIncognitoToast] = useState(false);
  const [view, setView] = useState('links');
  const [discussLinkId, setDiscussLinkId] = useState(null);

  const incognitoToastRef = useRef(null);
  const showIncognitoToast = useCallback(() => {
    if (incognitoToastRef.current) clearTimeout(incognitoToastRef.current);
    setIncognitoToast(true);
    incognitoToastRef.current = setTimeout(() => {
      setIncognitoToast(false);
      incognitoToastRef.current = null;
    }, 4500);
  }, []);

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.trim().toLowerCase();
    return links.filter(
      (l) =>
        (l.label && l.label.toLowerCase().includes(q)) ||
        (l.url && l.url.toLowerCase().includes(q))
    );
  }, [links, search]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  if (error) {
    return (
      <>
        <header className="header">
          <h1>EJ Entertainment</h1>
        </header>
        <div className="error">Error: {error}</div>
      </>
    );
  }

  return (
    <>
      {incognitoToast && (
        <div className="toast toast--incognito" role="status" aria-live="polite">
          <span className="toast__icon">🔒</span>
          <div className="toast__content">
            <strong>URL copied for Incognito</strong>
            <p>Open a private window ({incognitoShortcut}), then paste ({pasteShortcut}) in the address bar.</p>
          </div>
        </div>
      )}
      <header className="header">
        <div className="header__inner">
          <div>
            <h1 className="header__title">EJ Entertainment</h1>
            <p className="header__tagline">Browse by category</p>
            {visitor?.name && (
              <span className="header__visitor-name">({visitor.name})</span>
            )}
          </div>
          <button
            type="button"
            className="header__admin-link header__logout"
            onClick={logout}
            aria-label="Log out"
          >
            Log out
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <nav className="nav" role="navigation" aria-label="Categories">
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                className={`nav-item ${selectedCategoryId === cat._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategoryId(cat._id);
                  setSearch('');
                }}
              >
                <span className="nav-item__name">{cat.name}</span>
                <span className="nav-item__count">{cat.count ?? 0}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="main">
          {view === 'discuss' ? (
            <DiscussPage
              linkId={discussLinkId}
              onBack={() => { setDiscussLinkId(null); setView('links'); }}
              onReplyPosted={(linkId, updatedLink) => updateLink(linkId, updatedLink)}
            />
          ) : loading ? (
            <div className="loading">
              <span className="loading__spinner" />
              <span>Loading…</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📂</div>
              <p><strong>No categories.</strong></p>
              <p>Ensure backend is running and run <code>npm run seed</code> in the <code>backend</code> folder to load categories and links from MongoDB.</p>
            </div>
          ) : (
            <>
              <div className="main__toolbar">
                <h2 className="main__title">
                  {selectedCategory?.name ?? 'Links'}
                  {selectedCategory && (
                    <span className="main__count">({filteredLinks.length})</span>
                  )}
                </h2>
                <input
                  type="search"
                  placeholder="Search in this category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="main__search"
                  aria-label="Search links"
                />
                <button
                  type="button"
                  className="main__discuss-btn"
                  onClick={() => setView('discuss')}
                  title="Open discussion"
                >
                  Discuss
                </button>
              </div>

              {filteredLinks.length === 0 ? (
                <div className="empty-state empty-state--small">
                  <p>
                    {search
                      ? `No links match "${search}". Try another search.`
                      : 'No links in this category.'}
                  </p>
                </div>
              ) : (
                <ul className="link-list" role="list">
                  {filteredLinks.map((link) => (
                    <LinkCard
                      key={link._id}
                      link={link}
                      onIncognito={showIncognitoToast}
                      onOpenDiscuss={(linkId) => { setDiscussLinkId(linkId); setView('discuss'); }}
                      onUpdateLink={updateLink}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
