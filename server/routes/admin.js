import { Router } from 'express';

export function createAdminRouter(db, { requireAuth, requireAdmin }) {
  const router = Router();
  router.use(requireAuth, requireAdmin);

  router.get('/stats', (_req, res) => {
    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const paidUsers = db
      .prepare("SELECT COUNT(*) AS count FROM users WHERE plan_slug != 'freemium'")
      .get().count;
    const newsletterCount = db
      .prepare("SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE status = 'subscribed'")
      .get().count;
    const unreadMessages = db
      .prepare("SELECT COUNT(*) AS count FROM contact_messages WHERE status = 'unread'")
      .get().count;
    const totalDownloads = db
      .prepare('SELECT COALESCE(SUM(download_count), 0) AS total FROM releases')
      .get().total;
    const revenueRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM payments WHERE status = 'paid'")
      .get();

    res.json({
      totalUsers,
      paidUsers,
      newsletterCount,
      unreadMessages,
      totalDownloads,
      totalRevenue: Number(revenueRow.total || 0),
      paidOrdersCount: revenueRow.count || 0,
    });
  });

  // --- Users / Members ---
  router.get('/users', (req, res) => {
    const search = String(req.query.search || '').trim().toLowerCase();
    let users = db
      .prepare(
        'SELECT id, name, email, role, plan_slug, billing_cycle, status, company, created_at FROM users ORDER BY id DESC'
      )
      .all();

    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.company || '').toLowerCase().includes(search)
      );
    }
    res.json({ users });
  });

  router.patch('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'User not found.' });

    const { role, plan_slug, billing_cycle, status, company, name } = req.body || {};
    db.prepare(
      `UPDATE users
       SET name = ?, role = ?, plan_slug = ?, billing_cycle = ?, status = ?, company = ?
       WHERE id = ?`
    ).run(
      name ?? existing.name,
      role ?? existing.role,
      plan_slug ?? existing.plan_slug,
      billing_cycle ?? existing.billing_cycle,
      status ?? existing.status,
      company ?? existing.company,
      id
    );

    const updated = db
      .prepare(
        'SELECT id, name, email, role, plan_slug, billing_cycle, status, company, created_at FROM users WHERE id = ?'
      )
      .get(id);
    res.json({ user: updated });
  });

  router.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ deleted: true });
  });

  // --- Pricing Plans ---
  router.get('/plans', (_req, res) => {
    const plans = db
      .prepare('SELECT * FROM pricing_plans ORDER BY sort_order ASC, id ASC')
      .all()
      .map((p) => ({ ...p, features: JSON.parse(p.features_json || '[]') }));
    res.json({ plans });
  });

  router.post('/plans', (req, res) => {
    const {
      slug,
      name,
      description,
      monthly_price = 0,
      yearly_discount_percent = 20,
      price_label = '',
      is_custom = 0,
      is_popular = 0,
      is_active = 1,
      cta_label = 'Get Started',
      features = [],
      sort_order = 10,
    } = req.body || {};

    if (!slug || !name || !description) {
      return res.status(400).json({ error: 'slug, name, and description are required.' });
    }

    const result = db
      .prepare(
        `INSERT INTO pricing_plans (
          slug, name, description, monthly_price, yearly_discount_percent,
          price_label, is_custom, is_popular, is_active, cta_label, features_json, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        name,
        description,
        Number(monthly_price),
        Number(yearly_discount_percent),
        price_label,
        is_custom ? 1 : 0,
        is_popular ? 1 : 0,
        is_active ? 1 : 0,
        cta_label,
        JSON.stringify(Array.isArray(features) ? features : []),
        Number(sort_order)
      );

    const plan = db.prepare('SELECT * FROM pricing_plans WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ plan: { ...plan, features: JSON.parse(plan.features_json) } });
  });

  router.patch('/plans/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM pricing_plans WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Plan not found.' });

    const b = req.body || {};
    db.prepare(
      `UPDATE pricing_plans
       SET name = ?, description = ?, monthly_price = ?, yearly_discount_percent = ?,
           price_label = ?, is_custom = ?, is_popular = ?, is_active = ?, cta_label = ?,
           features_json = ?, sort_order = ?
       WHERE id = ?`
    ).run(
      b.name ?? existing.name,
      b.description ?? existing.description,
      b.monthly_price !== undefined ? Number(b.monthly_price) : existing.monthly_price,
      b.yearly_discount_percent !== undefined
        ? Number(b.yearly_discount_percent)
        : existing.yearly_discount_percent,
      b.price_label !== undefined ? b.price_label : existing.price_label,
      b.is_custom !== undefined ? (b.is_custom ? 1 : 0) : existing.is_custom,
      b.is_popular !== undefined ? (b.is_popular ? 1 : 0) : existing.is_popular,
      b.is_active !== undefined ? (b.is_active ? 1 : 0) : existing.is_active,
      b.cta_label ?? existing.cta_label,
      b.features !== undefined ? JSON.stringify(b.features) : existing.features_json,
      b.sort_order !== undefined ? Number(b.sort_order) : existing.sort_order,
      id
    );

    const updated = db.prepare('SELECT * FROM pricing_plans WHERE id = ?').get(id);
    res.json({ plan: { ...updated, features: JSON.parse(updated.features_json) } });
  });

  router.delete('/plans/:id', (req, res) => {
    db.prepare('DELETE FROM pricing_plans WHERE id = ?').run(Number(req.params.id));
    res.json({ deleted: true });
  });

  // --- Releases / Download Packages ---
  router.get('/releases', (_req, res) => {
    const releases = db.prepare('SELECT * FROM releases ORDER BY id DESC').all();
    res.json({ releases });
  });

  router.post('/releases', (req, res) => {
    const {
      version,
      platform,
      title,
      file_name,
      file_size = '120 MB',
      sha256 = 'pending-checksum',
      download_url = '',
      release_notes = '',
      is_available = 1,
    } = req.body || {};

    if (!version || !platform || !title || !file_name) {
      return res
        .status(400)
        .json({ error: 'version, platform, title, and file_name are required.' });
    }

    const result = db
      .prepare(
        `INSERT INTO releases (version, platform, title, file_name, file_size, sha256, download_url, release_notes, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        version,
        platform,
        title,
        file_name,
        file_size,
        sha256,
        download_url,
        release_notes,
        is_available ? 1 : 0
      );

    const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ release });
  });

  router.patch('/releases/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM releases WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Release not found.' });

    const b = req.body || {};
    db.prepare(
      `UPDATE releases
       SET version = ?, platform = ?, title = ?, file_name = ?, file_size = ?,
           sha256 = ?, download_url = ?, release_notes = ?, is_available = ?
       WHERE id = ?`
    ).run(
      b.version ?? existing.version,
      b.platform ?? existing.platform,
      b.title ?? existing.title,
      b.file_name ?? existing.file_name,
      b.file_size ?? existing.file_size,
      b.sha256 ?? existing.sha256,
      b.download_url !== undefined ? b.download_url : existing.download_url,
      b.release_notes !== undefined ? b.release_notes : existing.release_notes,
      b.is_available !== undefined ? (b.is_available ? 1 : 0) : existing.is_available,
      id
    );

    const updated = db.prepare('SELECT * FROM releases WHERE id = ?').get(id);
    res.json({ release: updated });
  });

  router.delete('/releases/:id', (req, res) => {
    db.prepare('DELETE FROM releases WHERE id = ?').run(Number(req.params.id));
    res.json({ deleted: true });
  });

  // --- Newsletter ---
  router.get('/newsletter', (_req, res) => {
    const subscribers = db
      .prepare('SELECT * FROM newsletter_subscribers ORDER BY id DESC')
      .all();
    res.json({ subscribers });
  });

  router.delete('/newsletter/:id', (req, res) => {
    db.prepare('DELETE FROM newsletter_subscribers WHERE id = ?').run(Number(req.params.id));
    res.json({ deleted: true });
  });

  // --- Contact Messages ---
  router.get('/messages', (_req, res) => {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
    res.json({ messages });
  });

  router.patch('/messages/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Message not found.' });

    const { status, admin_note } = req.body || {};
    db.prepare('UPDATE contact_messages SET status = ?, admin_note = ? WHERE id = ?').run(
      status ?? existing.status,
      admin_note ?? existing.admin_note,
      id
    );
    res.json({ message: db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) });
  });

  router.delete('/messages/:id', (req, res) => {
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(Number(req.params.id));
    res.json({ deleted: true });
  });

  // --- Payments ---
  router.get('/payments', (_req, res) => {
    const payments = db.prepare('SELECT * FROM payments ORDER BY id DESC').all();
    res.json({ payments });
  });

  router.patch('/payments/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Payment not found.' });
    const { status } = req.body || {};
    db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status ?? existing.status, id);
    res.json({ payment: db.prepare('SELECT * FROM payments WHERE id = ?').get(id) });
  });

  // --- Site Settings ---
  router.get('/settings', (_req, res) => {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
  });

  router.put('/settings', (req, res) => {
    const updates = req.body || {};
    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `);

    for (const [key, value] of Object.entries(updates)) {
      upsert.run(String(key), String(value ?? ''));
    }

    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
  });

  // --- Feedbacks ---
  router.get('/feedbacks', (_req, res) => {
    const feedbacks = db
      .prepare(
        `SELECT f.*, u.name AS user_name, u.email AS user_email
         FROM feedbacks f
         LEFT JOIN users u ON u.id = f.user_id
         ORDER BY f.id DESC`
      )
      .all();
    res.json({ feedbacks });
  });

  router.patch('/feedbacks/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Feedback not found.' });

    const { status, admin_reply } = req.body || {};
    db.prepare('UPDATE feedbacks SET status = ?, admin_reply = ? WHERE id = ?').run(
      status ?? existing.status,
      admin_reply !== undefined ? admin_reply : existing.admin_reply,
      id
    );
    res.json({ feedback: db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(id) });
  });

  router.delete('/feedbacks/:id', (req, res) => {
    db.prepare('DELETE FROM feedbacks WHERE id = ?').run(Number(req.params.id));
    res.json({ deleted: true });
  });

  return router;
}
