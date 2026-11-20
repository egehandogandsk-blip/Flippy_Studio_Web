import crypto from 'node:crypto';
import { Router } from 'express';
import { hashPassword, signToken, verifyPassword } from '../auth.js';

function ensureUserSettings(db, userId) {
  let row = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  if (!row) {
    const apiKey = `flp_live_${crypto.randomBytes(16).toString('hex')}`;
    db.prepare('INSERT INTO user_settings (user_id, api_key) VALUES (?, ?)').run(userId, apiKey);
    row = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  }
  return row;
}

export function createAuthRouter(db, { requireAuth }) {
  const router = Router();

  router.post('/register', (req, res) => {
    const { name, email, password, company = '' } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const result = db
      .prepare(
        `INSERT INTO users (name, email, password_hash, role, plan_slug, billing_cycle, status, company)
         VALUES (?, ?, ?, 'user', 'freemium', 'monthly', 'active', ?)`
      )
      .run(String(name).trim(), normalizedEmail, hashPassword(password), String(company).trim());

    const user = db
      .prepare(
        'SELECT id, name, email, role, plan_slug, billing_cycle, status, company, created_at FROM users WHERE id = ?'
      )
      .get(result.lastInsertRowid);

    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ token, user });
  });

  router.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const record = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!record || !verifyPassword(password, record.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (record.status !== 'active') {
      return res.status(403).json({ error: 'Your account is currently suspended.' });
    }

    const token = signToken({ sub: record.id, role: record.role });
    const { password_hash: _ignored, ...user } = record;
    res.json({ token, user });
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  router.patch('/me', requireAuth, (req, res) => {
    const { name, company } = req.body || {};
    const nextName = name !== undefined ? String(name).trim() : req.user.name;
    const nextCompany = company !== undefined ? String(company).trim() : req.user.company;
    if (!nextName) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    db.prepare('UPDATE users SET name = ?, company = ? WHERE id = ?').run(
      nextName,
      nextCompany,
      req.user.id
    );
    const updated = db
      .prepare(
        'SELECT id, name, email, role, plan_slug, billing_cycle, status, company, created_at FROM users WHERE id = ?'
      )
      .get(req.user.id);
    res.json({ user: updated });
  });

  router.get('/settings', requireAuth, (req, res) => {
    const settings = ensureUserSettings(db, req.user.id);
    res.json({ settings });
  });

  router.put('/settings', requireAuth, (req, res) => {
    const current = ensureUserSettings(db, req.user.id);
    const b = req.body || {};

    const wsPort = Number(b.ws_port ?? current.ws_port);
    if (Number.isNaN(wsPort) || wsPort < 1024 || wsPort > 65535) {
      return res.status(400).json({ error: 'WebSocket port must be between 1024 and 65535.' });
    }

    db.prepare(
      `UPDATE user_settings
       SET preferred_engine = ?, ws_port = ?, sync_protocol = ?,
           auto_atlas_pot = ?, nine_slice_auto = ?, ai_style_lock = ?,
           vcs_integration = ?, release_channel = ?, email_notifications = ?,
           updated_at = datetime('now')
       WHERE user_id = ?`
    ).run(
      b.preferred_engine ?? current.preferred_engine,
      wsPort,
      b.sync_protocol ?? current.sync_protocol,
      b.auto_atlas_pot !== undefined ? (b.auto_atlas_pot ? 1 : 0) : current.auto_atlas_pot,
      b.nine_slice_auto !== undefined ? (b.nine_slice_auto ? 1 : 0) : current.nine_slice_auto,
      b.ai_style_lock !== undefined ? (b.ai_style_lock ? 1 : 0) : current.ai_style_lock,
      b.vcs_integration ?? current.vcs_integration,
      b.release_channel ?? current.release_channel,
      b.email_notifications !== undefined
        ? b.email_notifications
          ? 1
          : 0
        : current.email_notifications,
      req.user.id
    );

    res.json({ settings: ensureUserSettings(db, req.user.id) });
  });

  router.post('/rotate-key', requireAuth, (req, res) => {
    ensureUserSettings(db, req.user.id);
    const nextKey = `flp_live_${crypto.randomBytes(16).toString('hex')}`;
    db.prepare(
      "UPDATE user_settings SET api_key = ?, updated_at = datetime('now') WHERE user_id = ?"
    ).run(nextKey, req.user.id);
    res.json({ api_key: nextKey });
  });

  router.post('/change-password', requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const record = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!record || !verifyPassword(currentPassword, record.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
      hashPassword(newPassword),
      req.user.id
    );
    res.json({ changed: true, message: 'Password updated successfully.' });
  });

  return router;
}
