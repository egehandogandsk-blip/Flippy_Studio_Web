import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './auth.js';

export function initDatabase(dbPath = process.env.DB_PATH || './data/flippy.db') {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(dbPath));
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      plan_slug TEXT NOT NULL DEFAULT 'freemium',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      status TEXT NOT NULL DEFAULT 'active',
      company TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pricing_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      monthly_price REAL NOT NULL DEFAULT 0,
      yearly_discount_percent INTEGER NOT NULL DEFAULT 20,
      price_label TEXT DEFAULT '',
      is_custom INTEGER NOT NULL DEFAULT 0,
      is_popular INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      cta_label TEXT NOT NULL DEFAULT 'Get Started',
      features_json TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL,
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size TEXT NOT NULL,
      sha256 TEXT NOT NULL,
      download_url TEXT DEFAULT '',
      release_notes TEXT DEFAULT '',
      is_available INTEGER NOT NULL DEFAULT 1,
      download_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'website',
      status TEXT NOT NULL DEFAULT 'subscribed',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      admin_note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      plan_slug TEXT NOT NULL,
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      provider TEXT NOT NULL DEFAULT 'sandbox',
      provider_session_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      preferred_engine TEXT NOT NULL DEFAULT 'unity',
      ws_port INTEGER NOT NULL DEFAULT 9420,
      sync_protocol TEXT NOT NULL DEFAULT 'protobuf',
      auto_atlas_pot INTEGER NOT NULL DEFAULT 1,
      nine_slice_auto INTEGER NOT NULL DEFAULT 1,
      ai_style_lock INTEGER NOT NULL DEFAULT 1,
      vcs_integration TEXT NOT NULL DEFAULT 'github',
      release_channel TEXT NOT NULL DEFAULT 'beta',
      email_notifications INTEGER NOT NULL DEFAULT 1,
      api_key TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'feature',
      engine TEXT NOT NULL DEFAULT 'unity',
      severity TEXT NOT NULL DEFAULT 'medium',
      app_version TEXT NOT NULL DEFAULT 'v0.9.4-beta',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      admin_reply TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedInitialData(db);
  return db;
}

function seedInitialData(db) {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, plan_slug, billing_cycle, status, company)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(
      'Egehan Dogan',
      'admin@flippy.studio',
      hashPassword('FlippyAdmin2026!'),
      'admin',
      'enterprise',
      'yearly',
      'active',
      'Branchout Studio'
    );
    insertUser.run(
      'Demo Developer',
      'dev@flippy.studio',
      hashPassword('FlippyDev2026!'),
      'user',
      'studio-pro',
      'monthly',
      'active',
      'Indie Forge Games'
    );
  }

  const planCount = db.prepare('SELECT COUNT(*) AS count FROM pricing_plans').get().count;
  if (planCount === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO pricing_plans (
        slug, name, description, monthly_price, yearly_discount_percent,
        price_label, is_custom, is_popular, is_active, cta_label, features_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const plans = [
      {
        slug: 'freemium',
        name: 'Freemium',
        description:
          "A basic version of Flippy's hybrid canvas features with limited functionality. Ideal for basic interface development.",
        monthly_price: 0,
        yearly_discount_percent: 20,
        price_label: '',
        is_custom: 0,
        is_popular: 0,
        is_active: 1,
        cta_label: 'Start Free',
        features: [
          'Hybrid Canvas',
          'Limited Gen AI Library',
          'Object Recognition AI',
          'Flippy Live Sync Plugins',
          'Smart Design Token',
        ],
        sort_order: 1,
      },
      {
        slug: 'indie-starter',
        name: 'Indie Starter',
        description:
          'For indie developers featuring Hybrid Canvas, Unity Live Sync, and a monthly allocation of AI tokens.',
        monthly_price: 9,
        yearly_discount_percent: 20,
        price_label: '',
        is_custom: 0,
        is_popular: 1,
        is_active: 1,
        cta_label: 'Get Indie Starter',
        features: [
          'Flippy Vision',
          'Enhanced data governance',
          'Flippy Engine Bridge',
          'Flippy Live Sync Plugins',
          'Custom model training',
        ],
        sort_order: 2,
      },
      {
        slug: 'studio-pro',
        name: 'Studio Pro',
        description:
          'In addition to the Indie Starter membership, teamwork support, multi-engine sync, and up to 5 game projects.',
        monthly_price: 14,
        yearly_discount_percent: 20,
        price_label: '',
        is_custom: 0,
        is_popular: 0,
        is_active: 1,
        cta_label: 'Get Studio Pro',
        features: [
          'Universal team connectivity',
          'Up to 5 Game Projects',
          'Latency-Optimized AI',
          'Flippy Multi-Engine Bridge',
          'Custom model training',
        ],
        sort_order: 3,
      },
      {
        slug: 'enterprise',
        name: 'Enterprise',
        description:
          'In addition to the Studio Pro membership, includes corporate API support, private library, admin panel, and seat management for up to 5 users.',
        monthly_price: 49,
        yearly_discount_percent: 20,
        price_label: '',
        is_custom: 0,
        is_popular: 0,
        is_active: 1,
        cta_label: 'Get Enterprise',
        features: [
          'Cloud Persistence & API',
          'Tailored model optimization',
          'Protocol Optimization',
          'Style-Consistent Asset Generation',
          'Flippy AI Engine Core',
        ],
        sort_order: 4,
      },
      {
        slug: 'ai-token-pack',
        name: 'AI Token Pack',
        description:
          'Credit packages for game studios and corporate entities tailored to specific needs, with AI credit packs from 2,000 to 6,000 tokens.',
        monthly_price: 20,
        yearly_discount_percent: 20,
        price_label: '$20 - $45',
        is_custom: 0,
        is_popular: 0,
        is_active: 1,
        cta_label: 'Buy Token Pack',
        features: [
          'Token Calculator',
          'Scalable Credit',
          'All Access Train Library',
          'MCP Connection',
          'Automated Asset Variations',
        ],
        sort_order: 5,
      },
      {
        slug: 'custom-model',
        name: 'Custom Model',
        description:
          'In addition to the Enterprise membership, offers a fully closed-loop AI training model tailored to your studio and comprehensive privacy protection.',
        monthly_price: 0,
        yearly_discount_percent: 20,
        price_label: 'Contact Us',
        is_custom: 1,
        is_popular: 0,
        is_active: 1,
        cta_label: 'Contact Sales',
        features: [
          'Studio Privacy',
          'Tailored model optimization',
          'Custom SDK Licensing',
          'Style-Consistent Asset Generation',
          'Data Stream',
        ],
        sort_order: 6,
      },
    ];

    for (const p of plans) {
      insertPlan.run(
        p.slug,
        p.name,
        p.description,
        p.monthly_price,
        p.yearly_discount_percent,
        p.price_label,
        p.is_custom,
        p.is_popular,
        p.is_active,
        p.cta_label,
        JSON.stringify(p.features),
        p.sort_order
      );
    }
  }

  const releaseCount = db.prepare('SELECT COUNT(*) AS count FROM releases').get().count;
  if (releaseCount === 0) {
    const insertRelease = db.prepare(`
      INSERT INTO releases (
        version, platform, title, file_name, file_size, sha256, download_url, release_notes, is_available, download_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const releases = [
      [
        'v0.9.4-beta',
        'windows',
        'Flippy Studio for Windows (x64)',
        'Flippy-Studio-0.9.4-beta-win-x64.exe',
        '142 MB',
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        '',
        'Includes C++/Rust Hybrid Canvas, WebGL/PixiJS renderer, and Live-Sync Bridge for Unity, Unreal & Godot.',
        1,
        128,
      ],
      [
        'v0.9.4-beta',
        'macos',
        'Flippy Studio for macOS (Apple Silicon & Intel)',
        'Flippy-Studio-0.9.4-beta-universal.dmg',
        '136 MB',
        '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
        '',
        'Universal binary with Metal GPU acceleration and local Flippy Vision AI.',
        0,
        84,
      ],
      [
        'v0.9.4-beta',
        'linux',
        'Flippy Studio for Linux (AppImage)',
        'Flippy-Studio-0.9.4-beta-x86_64.AppImage',
        '139 MB',
        '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        '',
        'Vulkan-accelerated Hybrid Canvas and local IPC WebSocket daemon.',
        0,
        19,
      ],
      [
        'v1.2.0',
        'unity',
        'Flippy Live-Sync Plugin for Unity (UGUI & UI Toolkit)',
        'FlippyLiveSync-Unity-1.2.0.unitypackage',
        '4.8 MB',
        'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        '',
        'Supports Unity 2022.3 LTS and Unity 6. Sub-millisecond RectTransform & Prefab synchronization.',
        1,
        312,
      ],
      [
        'v1.2.0',
        'unreal',
        'Flippy Live-Sync Plugin for Unreal Engine 5 (UMG / Slate)',
        'FlippyLiveSync-UE5-1.2.0.zip',
        '6.2 MB',
        '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        '',
        'Supports Unreal Engine 5.3 - 5.5 with automatic Slate Slot and Widget Blueprint generation.',
        0,
        204,
      ],
      [
        'v1.2.0',
        'godot',
        'Flippy Live-Sync Addon for Godot 4 (Control Nodes)',
        'FlippyLiveSync-Godot4-1.2.0.zip',
        '2.1 MB',
        'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        '',
        'Supports Godot 4.2+ with GDScript & C# Control Node hierarchy mapping.',
        0,
        157,
      ],
    ];

    for (const r of releases) {
      insertRelease.run(...r);
    }
  }

  const settingCount = db.prepare('SELECT COUNT(*) AS count FROM site_settings').get().count;
  if (settingCount === 0) {
    const insertSetting = db.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?)'
    );
    const targetDate = new Date(Date.now() + 54 * 86400000 + 18 * 3600000).toISOString();
    const defaults = [
      ['countdown_target', targetDate],
      ['hero_eyebrow', 'The Next Generation Game UI Design Platform'],
      ['hero_title', 'The AI Platform Powering Instant Canvas-to-Engine UI Production'],
      [
        'hero_subtitle',
        'We eliminate the billion-dollar bottleneck between game design and engineering. Flippy synchronizes vector components, responsive layouts, and state hierarchies into production-ready game engine prefabs at sub-millisecond speeds.',
      ],
      ['announcement_text', 'Flippy Studio v0.9.4 Beta & Live-Sync Engine Plugins are now open for early access.'],
      ['payment_provider', process.env.PAYMENT_PROVIDER || 'sandbox'],
      ['contact_email', 'hello@branchout.studio'],
      ['yearly_discount_percent', '20'],
    ];
    for (const [k, v] of defaults) {
      insertSetting.run(k, v);
    }
  }
}
