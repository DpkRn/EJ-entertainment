import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'jitu-discuss-comments';

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(ms) {
  const d = new Date(ms);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function findAndMutate(items, id, fn) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      fn(items[i]);
      return true;
    }
    if (items[i].replies?.length && findAndMutate(items[i].replies, id, fn)) return true;
  }
  return false;
}

function CommentBlock({ item, onReply, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  const handleSubmitReply = (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    onReply(item.id, text, replyAuthor.trim() || 'Anonymous');
    setReplyText('');
    setReplyAuthor('');
    setShowReplyForm(false);
  };

  return (
    <div className={`comment-block ${depth > 0 ? 'comment-block--reply' : ''}`} style={{ marginLeft: depth ? 24 : 0 }}>
      <div className="comment-block__header">
        <span className="comment-block__author">{item.author || 'Anonymous'}</span>
        <span className="comment-block__date">{formatDate(item.date)}</span>
      </div>
      <p className="comment-block__text">{item.text}</p>
      <button
        type="button"
        className="comment-block__reply-btn"
        onClick={() => setShowReplyForm((v) => !v)}
      >
        Reply
      </button>

      {showReplyForm && (
        <form className="comment-form comment-form--inline" onSubmit={handleSubmitReply}>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
            className="comment-form__name"
          />
          <textarea
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="comment-form__text"
            rows={2}
            required
          />
          <div className="comment-form__actions">
            <button type="button" className="comment-form__cancel" onClick={() => setShowReplyForm(false)}>
              Cancel
            </button>
            <button type="submit" className="comment-form__submit">
              Reply
            </button>
          </div>
        </form>
      )}

      {item.replies?.length > 0 && (
        <div className="comment-block__replies">
          {item.replies.map((r) => (
            <CommentBlock key={r.id} item={r} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscussPage({ linkId, onBack, onReplyPosted }) {
  const [comments, setComments] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  });

  const [newAuthor, setNewAuthor] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (_) {}
  }, [comments]);

  const addComment = useCallback(async (e) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      {
        id: genId(),
        text,
        author: newAuthor.trim() || 'Anonymous',
        date: Date.now(),
        replies: [],
      },
    ]);
    setNewText('');
    setNewAuthor('');
    if (linkId && onReplyPosted) {
      try {
        const res = await fetch(`/api/visitor/links/${linkId}/reply`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          onReplyPosted(linkId, data);
        }
      } catch (_) {}
    }
  }, [newText, newAuthor, linkId, onReplyPosted]);

  const addReply = useCallback(async (parentId, text, author) => {
    const reply = {
      id: genId(),
      text,
      author,
      date: Date.now(),
      replies: [],
    };
    setComments((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      findAndMutate(next, parentId, (parent) => {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(reply);
      });
      return next;
    });
    if (linkId && onReplyPosted) {
      try {
        const res = await fetch(`/api/visitor/links/${linkId}/reply`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          onReplyPosted(linkId, data);
        }
      } catch (_) {}
    }
  }, [linkId, onReplyPosted]);

  return (
    <div className="discuss-page">
      <div className="discuss-page__toolbar">
        <button type="button" className="discuss-page__back" onClick={onBack}>
          ← Back to links
        </button>
      </div>

      <h2 className="discuss-page__title">Discussion</h2>

      <form className="comment-form" onSubmit={addComment}>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          className="comment-form__name"
        />
        <textarea
          placeholder="Write a comment…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="comment-form__text"
          rows={3}
          required
        />
        <button type="submit" className="comment-form__submit">
          Post comment
        </button>
      </form>

      <div className="discuss-page__list">
        {comments.length === 0 ? (
          <p className="discuss-page__empty">No comments yet. Be the first to comment.</p>
        ) : (
          comments.map((c) => <CommentBlock key={c.id} item={c} onReply={addReply} />)
        )}
      </div>
    </div>
  );
}
