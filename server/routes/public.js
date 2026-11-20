import { Router } from 'express';
import { sendContactEmail } from '../services/mailer.js';

export function createPublicRouter(db) {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'flippy-studio-api', timestamp: new Date().toISOString() });
  });

  router.get('/site-data', (_req, res) => {
    const settingsRows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

    const plans = db
      .prepare('SELECT * FROM pricing_plans WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
      .all()
      .map((p) => ({
        ...p,
        features: JSON.parse(p.features_json || '[]'),
      }));

    const releases = db
      .prepare('SELECT * FROM releases ORDER BY id ASC')
      .all();

    res.json({ settings, plans, releases });
  });

  router.get('/plans', (_req, res) => {
    const plans = db
      .prepare('SELECT * FROM pricing_plans WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
      .all()
      .map((p) => ({
        ...p,
        features: JSON.parse(p.features_json || '[]'),
      }));
    res.json({ plans });
  });

  router.get('/releases', (_req, res) => {
    const releases = db.prepare('SELECT * FROM releases ORDER BY id ASC').all();
    res.json({ releases });
  });

  router.get('/releases/:id/download', (req, res) => {
    const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(Number(req.params.id));
    if (!release) {
      return res.status(404).json({ error: 'Release package not found.' });
    }
    if (!release.is_available) {
      return res.status(409).json({
        error: 'This package is scheduled for upcoming release. Join the newsletter to get notified.',
      });
    }

    db.prepare('UPDATE releases SET download_count = download_count + 1 WHERE id = ?').run(
      release.id
    );

    if (release.download_url && /^https?:\/\//i.test(release.download_url)) {
      return res.redirect(release.download_url);
    }

    const packageManifest = JSON.stringify(
      {
        product: 'Flippy Studio',
        publisher: 'Branchout Studio',
        version: release.version,
        platform: release.platform,
        fileName: release.file_name,
        sha256: release.sha256,
        releaseNotes: release.release_notes,
        downloadedAt: new Date().toISOString(),
        notice:
          'This is the verified Flippy Studio installer manifest stub. Replace download_url in Admin Panel > Releases with your signed CDN binary URL when publishing production builds.',
      },
      null,
      2
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${release.file_name}.manifest.json"`);
    res.send(packageManifest);
  });

  router.post('/newsletter/subscribe', (req, res) => {
    const { email, source = 'website' } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existing = db
      .prepare('SELECT * FROM newsletter_subscribers WHERE email = ?')
      .get(normalizedEmail);

    if (existing) {
      if (existing.status === 'unsubscribed') {
        db.prepare("UPDATE newsletter_subscribers SET status = 'subscribed' WHERE id = ?").run(
          existing.id
        );
        return res.json({ subscribed: true, message: 'Welcome back! Subscription reactivated.' });
      }
      return res.json({
        subscribed: true,
        alreadySubscribed: true,
        message: 'You are already subscribed to Flippy Studio updates.',
      });
    }

    db.prepare(
      "INSERT INTO newsletter_subscribers (email, source, status) VALUES (?, ?, 'subscribed')"
    ).run(normalizedEmail, String(source).slice(0, 60));

    res.status(201).json({
      subscribed: true,
      message: 'Successfully subscribed to Flippy Studio release updates!',
    });
  });

  router.post('/contact', async (req, res) => {
    const { name, email, subject, category = 'general', message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ error: 'Name, email, subject, and message are all required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const result = db
      .prepare(
        `INSERT INTO contact_messages (name, email, subject, category, message, status)
         VALUES (?, ?, ?, ?, ?, 'unread')`
      )
      .run(
        String(name).trim(),
        normalizedEmail,
        String(subject).trim(),
        String(category).trim(),
        String(message).trim()
      );

    const contactSetting = db
      .prepare("SELECT value FROM site_settings WHERE key = 'contact_email'")
      .get();

    let delivery;
    try {
      delivery = await sendContactEmail({
        name: String(name).trim(),
        email: normalizedEmail,
        subject: String(subject).trim(),
        category: String(category).trim(),
        message: String(message).trim(),
        toEmail: contactSetting?.value,
      });
    } catch (err) {
      delivery = { mode: 'stored_only', error: err.message };
    }

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      sent: true,
      delivery,
      message: 'Your message has been received. Our team will respond shortly.',
    });
  });

  return router;
}
