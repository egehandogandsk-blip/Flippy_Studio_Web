import { Router } from 'express';

export function createFeedbackRouter(db, { requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/my', (req, res) => {
    const feedbacks = db
      .prepare('SELECT * FROM feedbacks WHERE user_id = ? ORDER BY id DESC')
      .all(req.user.id);
    res.json({ feedbacks });
  });

  router.post('/', (req, res) => {
    const {
      category = 'feature',
      engine = 'unity',
      severity = 'medium',
      app_version = 'v0.9.4-beta',
      title,
      description,
    } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const result = db
      .prepare(
        `INSERT INTO feedbacks (user_id, category, engine, severity, app_version, title, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`
      )
      .run(
        req.user.id,
        String(category).trim(),
        String(engine).trim(),
        String(severity).trim(),
        String(app_version).trim(),
        String(title).trim(),
        String(description).trim()
      );

    const feedback = db
      .prepare('SELECT * FROM feedbacks WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({
      feedback,
      message: 'Feedback submitted to the Flippy engineering team.',
    });
  });

  return router;
}
