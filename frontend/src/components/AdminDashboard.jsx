import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useApp } from '../context/AppContext';

const TAB_CATEGORIES = 'categories';
const TAB_LINKS = 'links';
const TAB_VISITORS = 'visitors';

export default function AdminDashboard({ onBack }) {
  const { admin, logout, authError } = useAdmin();
  const { categories: publicCategories, setSelectedCategoryId } = useApp();
  const [tab, setTab] = useState(TAB_CATEGORIES);
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedCategoryId, setSelectedCategoryIdLocal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [formCategory, setFormCategory] = useState({ name: '', order: 0 });
  const [formLink, setFormLink] = useState({ url: '', label: '', category: '' });
  const [saving, setSaving] = useState(false);
  // In-category link form: which category is showing "Add link" form (Categories tab)
  const [addLinkForCategoryId, setAddLinkForCategoryId] = useState(null);
  const [addLinkForm, setAddLinkForm] = useState({ url: '', label: '' });
  // Visitors tab
  const [visitors, setVisitors] = useState([]);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [formVisitor, setFormVisitor] = useState({ privateKey: '', name: '', role: '', deviceID: [], noOfDevice: 1 });

  const loadCategories = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await admin.getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
      if (!selectedCategoryId && res.data?.length) {
        setSelectedCategoryIdLocal(res.data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [admin, selectedCategoryId]);

  const loadLinks = useCallback(async () => {
    if (!selectedCategoryId) {
      setLinks([]);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await admin.getLinksByCategory(selectedCategoryId);
      setLinks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load links.');
    } finally {
      setLoading(false);
    }
  }, [admin, selectedCategoryId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (tab === TAB_LINKS) loadLinks();
  }, [tab, selectedCategoryId, loadLinks]);

  const loadVisitors = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await admin.getVisitors();
      setVisitors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load visitors.');
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    if (tab === TAB_VISITORS) loadVisitors();
  }, [tab, loadVisitors]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!formCategory.name.trim()) return;
    setSaving(true);
    try {
      await admin.createCategory({ name: formCategory.name.trim(), order: Number(formCategory.order) || 0 });
      setFormCategory({ name: '', order: 0 });
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !formCategory.name.trim()) return;
    setSaving(true);
    try {
      await admin.updateCategory(editingCategory._id, {
        name: formCategory.name.trim(),
        order: Number(formCategory.order) ?? 0,
      });
      setEditingCategory(null);
      setFormCategory({ name: '', order: 0 });
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Links in it will need to be moved or will break.')) return;
    setSaving(true);
    try {
      await admin.deleteCategory(id);
      if (selectedCategoryId === id) setSelectedCategoryIdLocal('');
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete category.');
    } finally {
      setSaving(false);
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setFormCategory({ name: cat.name || '', order: cat.order ?? 0 });
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!formLink.url.trim() || !formLink.category) return;
    setSaving(true);
    try {
      await admin.createLink({
        url: formLink.url.trim(),
        label: (formLink.label || '').trim(),
        category: formLink.category,
      });
      setFormLink({ url: '', label: '', category: selectedCategoryId || '' });
      await loadLinks();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create link.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLinkInCategory = async (e, categoryId) => {
    e.preventDefault();
    if (!addLinkForm.url.trim() || !categoryId) return;
    setSaving(true);
    try {
      await admin.createLink({
        url: addLinkForm.url.trim(),
        label: (addLinkForm.label || '').trim(),
        category: categoryId,
      });
      setAddLinkForm({ url: '', label: '' });
      setAddLinkForCategoryId(null);
      await loadCategories();
      if (tab === TAB_LINKS && selectedCategoryId === categoryId) await loadLinks();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create link.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    if (!editingLink || !formLink.url.trim()) return;
    setSaving(true);
    try {
      await admin.updateLink(editingLink._id, {
        url: formLink.url.trim(),
        label: (formLink.label || '').trim(),
        category: formLink.category,
      });
      setEditingLink(null);
      setFormLink({ url: '', label: '', category: '' });
      await loadLinks();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update link.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    setSaving(true);
    try {
      await admin.deleteLink(id);
      setEditingLink(null);
      await loadLinks();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete link.');
    } finally {
      setSaving(false);
    }
  };

  const startEditLink = (link) => {
    setEditingLink(link);
    setFormLink({
      url: link.url || '',
      label: link.label || '',
      category: link.category?._id || link.category || '',
    });
  };

  const handleCreateVisitor = async (e) => {
    e.preventDefault();
    if (!formVisitor.privateKey.trim() || !formVisitor.name.trim() || !formVisitor.role.trim()) return;
    setSaving(true);
    try {
      await admin.createVisitor({
        privateKey: formVisitor.privateKey.trim(),
        name: formVisitor.name.trim(),
        role: formVisitor.role.trim(),
        deviceID: formVisitor.deviceID || [],
        noOfDevice: Number(formVisitor.noOfDevice) ?? 1,
      });
      setFormVisitor({ privateKey: '', name: '', role: '', deviceID: [], noOfDevice: 1 });
      setEditingVisitor(null);
      await loadVisitors();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create visitor.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVisitor = async (e) => {
    e.preventDefault();
    if (!editingVisitor || !formVisitor.privateKey.trim() || !formVisitor.name.trim() || !formVisitor.role.trim()) return;
    setSaving(true);
    try {
      await admin.updateVisitor(editingVisitor._id, {
        privateKey: formVisitor.privateKey.trim(),
        name: formVisitor.name.trim(),
        role: formVisitor.role.trim(),
        deviceID: Array.isArray(formVisitor.deviceID) ? formVisitor.deviceID : [],
        noOfDevice: Number(formVisitor.noOfDevice) ?? 1,
      });
      setEditingVisitor(null);
      setFormVisitor({ privateKey: '', name: '', role: '', deviceID: [], noOfDevice: 1 });
      await loadVisitors();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update visitor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVisitor = async (id) => {
    if (!window.confirm('Delete this visitor?')) return;
    setSaving(true);
    try {
      await admin.deleteVisitor(id);
      setEditingVisitor(null);
      await loadVisitors();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete visitor.');
    } finally {
      setSaving(false);
    }
  };

  const startEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setFormVisitor({
      privateKey: visitor.privateKey || '',
      name: visitor.name || '',
      role: visitor.role || '',
      deviceID: Array.isArray(visitor.deviceID) ? visitor.deviceID : [],
      noOfDevice: visitor.noOfDevice ?? 1,
    });
  };

  const categoryList = categories.length ? categories : publicCategories;

  const generatePrivateKey = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 6;
    const segmentLength = 4;
    const parts = [];
    for (let i = 0; i < segments; i++) {
      let part = '';
      for (let j = 0; j < segmentLength; j++) {
        part += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      parts.push(part);
    }
    const code = parts.join('-');
    setFormVisitor((p) => ({ ...p, privateKey: code }));
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__header-inner">
          <button type="button" className="admin-dashboard__back" onClick={onBack}>
            ← Back to app
          </button>
          <div className="admin-dashboard__tabs">
            <button
              type="button"
              className={`admin-dashboard__tab ${tab === TAB_CATEGORIES ? 'active' : ''}`}
              onClick={() => setTab(TAB_CATEGORIES)}
            >
              Categories
            </button>
            <button
              type="button"
              className={`admin-dashboard__tab ${tab === TAB_LINKS ? 'active' : ''}`}
              onClick={() => setTab(TAB_LINKS)}
            >
              Links
            </button>
            <button
              type="button"
              className={`admin-dashboard__tab ${tab === TAB_VISITORS ? 'active' : ''}`}
              onClick={() => setTab(TAB_VISITORS)}
            >
              Visitors
            </button>
          </div>
          <button type="button" className="admin-dashboard__logout" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {authError && (
        <div className="admin-dashboard__auth-error" role="alert">
          {authError}
        </div>
      )}

      {error && (
        <div className="admin-dashboard__error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <main className="admin-dashboard__main">
        {tab === TAB_CATEGORIES && (
          <section className="admin-section">
            <h2 className="admin-section__title">Categories</h2>
            <form
              className="admin-form"
              onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            >
              <input
                type="text"
                className="admin-form__input"
                placeholder="Category name"
                value={formCategory.name}
                onChange={(e) => setFormCategory((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                type="number"
                className="admin-form__input admin-form__input--small"
                placeholder="Order"
                value={formCategory.order}
                onChange={(e) => setFormCategory((p) => ({ ...p, order: e.target.value }))}
              />
              <button type="submit" className="admin-form__btn" disabled={saving}>
                {editingCategory ? 'Update' : 'Add'} category
              </button>
              {editingCategory && (
                <button
                  type="button"
                  className="admin-form__btn admin-form__btn--secondary"
                  onClick={() => {
                    setEditingCategory(null);
                    setFormCategory({ name: '', order: 0 });
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
            {loading ? (
              <p className="admin-section__loading">Loading…</p>
            ) : (
              <ul className="admin-list admin-list--categories">
                {categoryList.map((cat) => (
                  <li key={cat._id} className="admin-category-block">
                    <div className="admin-list__item">
                      <span className="admin-list__name">{cat.name}</span>
                      <span className="admin-list__meta">order: {cat.order ?? 0}</span>
                      <div className="admin-list__actions">
                        <button type="button" className="admin-list__btn admin-list__btn--add" onClick={() => setAddLinkForCategoryId(addLinkForCategoryId === cat._id ? null : cat._id)}>
                          {addLinkForCategoryId === cat._id ? 'Cancel' : '+ Add link'}
                        </button>
                        <button type="button" className="admin-list__btn" onClick={() => startEditCategory(cat)}>
                          Edit
                        </button>
                        <button type="button" className="admin-list__btn admin-list__btn--danger" onClick={() => handleDeleteCategory(cat._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {addLinkForCategoryId === cat._id && (
                      <form
                        className="admin-form admin-form--inline admin-form--category-link"
                        onSubmit={(e) => handleCreateLinkInCategory(e, cat._id)}
                      >
                        <input
                          type="url"
                          className="admin-form__input"
                          placeholder="URL"
                          value={addLinkForm.url}
                          onChange={(e) => setAddLinkForm((p) => ({ ...p, url: e.target.value }))}
                          required
                        />
                        <input
                          type="text"
                          className="admin-form__input"
                          placeholder="Label (optional)"
                          value={addLinkForm.label}
                          onChange={(e) => setAddLinkForm((p) => ({ ...p, label: e.target.value }))}
                        />
                        <button type="submit" className="admin-form__btn" disabled={saving}>
                          Add link
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === TAB_LINKS && (
          <section className="admin-section">
            <h2 className="admin-section__title">Links</h2>
            <form
              className="admin-form admin-form--stacked"
              onSubmit={editingLink ? handleUpdateLink : handleCreateLink}
            >
              <select
                className="admin-form__input"
                value={formLink.category || selectedCategoryId}
                onChange={(e) => setFormLink((p) => ({ ...p, category: e.target.value }))}
                required
              >
                <option value="">Select category</option>
                {categoryList.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <input
                type="url"
                className="admin-form__input"
                placeholder="URL"
                value={formLink.url}
                onChange={(e) => setFormLink((p) => ({ ...p, url: e.target.value }))}
                required
              />
              <input
                type="text"
                className="admin-form__input"
                placeholder="Label (optional)"
                value={formLink.label}
                onChange={(e) => setFormLink((p) => ({ ...p, label: e.target.value }))}
              />
              <div className="admin-form__row">
                <button type="submit" className="admin-form__btn" disabled={saving}>
                  {editingLink ? 'Update' : 'Add'} link
                </button>
                {editingLink && (
                  <button
                    type="button"
                    className="admin-form__btn admin-form__btn--secondary"
                    onClick={() => {
                      setEditingLink(null);
                      setFormLink({ url: '', label: '', category: selectedCategoryId || '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <div className="admin-section__filter">
              <label htmlFor="admin-cat-filter">Category filter:</label>
              <select
                id="admin-cat-filter"
                className="admin-form__input admin-form__input--inline"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryIdLocal(e.target.value)}
              >
                <option value="">All</option>
                {categoryList.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <p className="admin-section__loading">Loading…</p>
            ) : (
              <ul className="admin-list">
                {links.map((link) => (
                  <li key={link._id} className="admin-list__item admin-list__item--link">
                    <div className="admin-list__link-main">
                      <span className="admin-list__label">{link.label || link.url}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="admin-list__url">{link.url}</a>
                    </div>
                    <div className="admin-list__actions">
                      <button type="button" className="admin-list__btn" onClick={() => startEditLink(link)}>
                        Edit
                      </button>
                      <button type="button" className="admin-list__btn admin-list__btn--danger" onClick={() => handleDeleteLink(link._id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {tab === TAB_LINKS && !loading && selectedCategoryId && links.length === 0 && (
              <p className="admin-section__empty">No links in this category. Add one above.</p>
            )}
          </section>
        )}

        {tab === TAB_VISITORS && (
          <section className="admin-section">
            <h2 className="admin-section__title">Visitors</h2>
            <form
              className="admin-form admin-form--stacked"
              onSubmit={editingVisitor ? handleUpdateVisitor : handleCreateVisitor}
            >
              <div className="admin-form__row admin-form__row--inline">
                <input
                  type="text"
                  className="admin-form__input"
                  placeholder="Private key *"
                  value={formVisitor.privateKey}
                  onChange={(e) => setFormVisitor((p) => ({ ...p, privateKey: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="admin-form__btn admin-form__btn--secondary"
                  onClick={generatePrivateKey}
                  title="Generate 24-character code (XXXX-XXXX-XXXX-XXXX-XXXX-XXXX)"
                >
                  Generate code
                </button>
              </div>
              <input
                type="text"
                className="admin-form__input"
                placeholder="Name *"
                value={formVisitor.name}
                onChange={(e) => setFormVisitor((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <select
                className="admin-form__input"
                value={formVisitor.role}
                onChange={(e) => setFormVisitor((p) => ({ ...p, role: e.target.value }))}
                required
                aria-label="Role"
              >
                <option value="">Select role *</option>
                <option value="Admin">Admin</option>
                <option value="Visitor">Visitor</option>
              </select>
              <div className="admin-form__field">
                <label htmlFor="visitor-noOfDevice" className="admin-form__label">Device allowed</label>
                <input
                  id="visitor-noOfDevice"
                  type="number"
                  className="admin-form__input admin-form__input--small"
                  min={1}
                  value={formVisitor.noOfDevice}
                  onChange={(e) => setFormVisitor((p) => ({ ...p, noOfDevice: e.target.value }))}
                  aria-label="Device allowed"
                />
              </div>
              <div className="admin-form__row">
                <button type="submit" className="admin-form__btn" disabled={saving}>
                  {editingVisitor ? 'Update' : 'Add'} visitor
                </button>
                {editingVisitor && (
                  <button
                    type="button"
                    className="admin-form__btn admin-form__btn--secondary"
                    onClick={() => {
                      setEditingVisitor(null);
                      setFormVisitor({ privateKey: '', name: '', role: '', deviceID: [], noOfDevice: 1 });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <p className="admin-section__hint">New visitors get an empty device ID list. Device IDs can be managed on update.</p>
            {loading ? (
              <p className="admin-section__loading">Loading…</p>
            ) : (
              <ul className="admin-list">
                {visitors.map((v) => (
                  <li key={v._id} className="admin-list__item admin-list__item--visitor">
                    <div className="admin-list__visitor-main">
                      <span className="admin-list__name">{v.name}</span>
                      <span className="admin-list__meta">key: {v.privateKey}</span>
                      <span className="admin-list__meta">role: {v.role}</span>
                      <span className="admin-list__meta">devices: {Array.isArray(v.deviceID) ? v.deviceID.length : 0} / {v.noOfDevice ?? 1}</span>
                    </div>
                    <div className="admin-list__actions">
                      <button type="button" className="admin-list__btn" onClick={() => startEditVisitor(v)}>
                        Edit
                      </button>
                      <button type="button" className="admin-list__btn admin-list__btn--danger" onClick={() => handleDeleteVisitor(v._id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {tab === TAB_VISITORS && !loading && visitors.length === 0 && (
              <p className="admin-section__empty">No visitors yet. Add one above.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
