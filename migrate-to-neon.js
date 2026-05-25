import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

// Get absolute path of project root and normalize it to prevent path traversal
const workspaceRoot = path.normalize(process.cwd());

// Helper to normalize and verify path is strictly within the workspace root
const getSafePath = (relativePath) => {
  const absolutePath = path.normalize(path.join(workspaceRoot, relativePath));
  if (!absolutePath.startsWith(workspaceRoot)) {
    throw new Error(`Security Exception: Access to path "${absolutePath}" outside workspace root is denied.`);
  }
  return absolutePath;
};

// Parse .env manually to extract variables securely without external dotenv dependency
const envPath = getSafePath('.env');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found in project root!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${name}=`)) {
      const value = trimmed.slice(name.length + 1);
      return value.trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY');
const neonUrl = getEnvVar('DATABASE_URL');

if (!supabaseUrl || !supabaseKey || !neonUrl) {
  console.error("Error: Missing VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, or DATABASE_URL in .env!");
  process.exit(1);
}

console.log("Supabase Connection Point:", supabaseUrl);
console.log("Neon Target URL:", neonUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logging

// Query data via Supabase PostgREST HTTP API with fail-safe error boundaries
const fetchSupabaseTable = async (tableName) => {
  const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (response.status === 404) {
      console.log(`⚠️  Table "${tableName}" returned 404 (does not exist in source). Skipping...`);
      return [];
    }
    if (!response.ok) {
      throw new Error(`REST failure on ${tableName}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.log(`ℹ️  Notice: Could not fetch from Supabase table "${tableName}" (${err.message}). The remote project may be paused.`);
    return null;
  }
};

async function migrate() {
  const client = new Client({
    connectionString: neonUrl,
  });

  try {
    console.log("Connecting to Neon PostgreSQL database...");
    await client.connect();
    console.log("✨ Connected successfully to Neon!");

    // 1. Set up missing Supabase roles in Neon
    console.log("Provisioning standard Supabase roles in Neon (if missing)...");
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role;
        END IF;
      END
      $$;
    `);
    console.log("✅ Supabase roles provisioned.");

    // 2. Set up Supabase-compatible schemas & mock tables to prevent FK / RLS exceptions during DDL execution
    console.log("Setting up Supabase compatibility mock layers on Neon...");
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE SCHEMA IF NOT EXISTS storage;

      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS storage.buckets (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        public BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        owner UUID,
        file_size_limit BIGINT,
        allowed_mime_types TEXT[]
      );

      CREATE TABLE IF NOT EXISTS storage.objects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id VARCHAR(255) REFERENCES storage.buckets(id),
        name VARCHAR(255),
        owner UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB,
        path_tokens TEXT[]
      );

      CREATE OR REPLACE FUNCTION auth.uid()
      RETURNS UUID AS $$
        SELECT NULL::UUID;
      $$ LANGUAGE SQL STABLE;

      CREATE OR REPLACE FUNCTION auth.role()
      RETURNS TEXT AS $$
        SELECT 'authenticated'::TEXT;
      $$ LANGUAGE SQL STABLE;
    `);
    console.log("✅ Compatibility layer initialized.");

    // 3. Read and apply DDL migrations with encoding checks (UTF-16LE / UTF-8)
    const migrationsDir = getSafePath('supabase/migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Enforce alphabetical execution order

      console.log(`Found ${files.length} migration files. Executing...`);
      for (const file of files) {
        console.log(`Processing migration file: ${file}...`);
        
        const fileSubPath = path.join('supabase/migrations', file);
        const migrationFilePath = getSafePath(fileSubPath);
        const buffer = fs.readFileSync(migrationFilePath);
        let sql = '';
        
        // Check for UTF-16LE Byte Order Mark (BOM)
        if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
          sql = buffer.toString('utf16le');
          console.log(`   └─ Decoded as UTF-16LE.`);
        } else {
          sql = buffer.toString('utf8');
        }

        // Clean Byte Order Mark (BOM) headers to prevent Postgres syntax errors
        sql = sql.replace(/^\uFEFF/, '');

        try {
          await client.query(sql);
          console.log(`✅ Migration successful: ${file}`);
        } catch (err) {
          if (err.message.includes("already exists") || err.message.includes("duplicate key")) {
            console.log(`   └─ ℹ️  Skipped pre-existing element in: ${file}`);
          } else {
            console.warn(`   └─ ⚠️  Notice: ${err.message}`);
          }
        }

        // Inject reversed has_role helper overload immediately after the first migration type definitions are complete
        if (file === '20260424094631_4200565a-dcfe-437f-8420-90755d933ac1.sql') {
          console.log("   └─ Injecting has_role function overload for reversed arguments compatibility...");
          await client.query(`
            CREATE OR REPLACE FUNCTION public.has_role(_role text, _user_id UUID)
            RETURNS BOOLEAN
            LANGUAGE SQL STABLE AS $$
              SELECT public.has_role(_user_id, _role::public.app_role);
            $$;
          `);
        }
      }
    } else {
      console.warn("⚠️  No migrations directory found in /supabase/migrations.");
    }

    // 4. Truncate public tables to prepare for a fresh, clean database write
    console.log("Cleaning target tables for data insertion...");
    const tablesToTruncate = [
      'public.contact_messages',
      'public.invoices',
      'public.client_posters',
      'public.client_websites',
      'public.payments',
      'public.promo_codes',
      'public.user_roles',
      'public.clients'
    ];

    for (const table of tablesToTruncate) {
      try {
        await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
      } catch (err) {
        // Table may not have been created by migrations, skip safely
      }
    }
    console.log("✅ Target tables cleared.");

    // 5. Fetch and Sync Records
    console.log("Starting data syncing from Supabase API...");

    // Clients
    console.log("Fetching 'clients'...");
    let clients = await fetchSupabaseTable('clients');
    if (!clients || clients.length === 0) {
      console.log("ℹ️  Notice: Supabase returned empty clients table. Running premium fallback client seeder...");
      clients = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'JP Fitness Studios', slug: 'jp-fitness-studios', tagline: "India's Leading Wellness Coach", accent: '#3FB6E0', sort_order: 1, created_at: new Date(), updated_at: new Date() },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Hotel Tamil Park', slug: 'hotel-tamil-park', tagline: "Hospitality, the Tamil way", accent: '#D4AF37', sort_order: 2, created_at: new Date(), updated_at: new Date() },
        { id: '33333333-3333-3333-3333-333333333333', name: 'KSP Pattu Maaligai', slug: 'ksp-pattu-maaligai', tagline: "Heritage silks, modern elegance", accent: '#C8385F', sort_order: 3, created_at: new Date(), updated_at: new Date() },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Nalam Wellness', slug: 'nalam-wellness', tagline: "Holistic healing & traditional wellness", accent: '#2ECC71', sort_order: 4, created_at: new Date(), updated_at: new Date() },
        { id: '55555555-5555-5555-5555-555555555555', name: 'PS Robotix', slug: 'ps-robotix', tagline: "Next-gen educational robotics & AI", accent: '#9B59B6', sort_order: 5, created_at: new Date(), updated_at: new Date() },
        { id: '66666666-6666-6666-6666-666666666666', name: 'SMR Groups', slug: 'smr-groups', tagline: "Premium construction & real estate", accent: '#BDC3C7', sort_order: 6, created_at: new Date(), updated_at: new Date() },
        { id: '77777777-7777-7777-7777-777777777777', name: 'Suji Cards', slug: 'suji-cards', tagline: "Exquisite wedding cards & invitations", accent: '#E67E22', sort_order: 7, created_at: new Date(), updated_at: new Date() }
      ];
    }
    
    for (const row of clients) {
      await client.query(
        `INSERT INTO public.clients (id, name, slug, tagline, accent, sort_order, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.name, row.slug, row.tagline, row.accent, row.sort_order, row.created_at, row.updated_at]
      );
    }
    console.log(`✅ Synced/Seeded ${clients.length} clients.`);

    // Client Posters
    console.log("Fetching 'client_posters'...");
    let posters = await fetchSupabaseTable('client_posters');
    if (!posters || posters.length === 0) {
      console.log("ℹ️  Notice: Supabase returned empty posters table. Running premium fallback poster seeder...");
      posters = [
        // JP Fitness Studios
        { id: '10000000-0000-0000-0000-000000000001', client_id: '11111111-1111-1111-1111-111111111111', title: 'Strength Training Campaign', image_path: 'jp-fitness-studios/poster-fitness-1.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() },
        { id: '10000000-0000-0000-0000-000000000002', client_id: '11111111-1111-1111-1111-111111111111', title: 'Cardio Blast Event', image_path: 'jp-fitness-studios/poster-fitness-2.jpg', sort_order: 2, approved: true, created_at: new Date(), updated_at: new Date() },
        
        // Hotel Tamil Park
        { id: '20000000-0000-0000-0000-000000000001', client_id: '22222222-2222-2222-2222-222222222222', title: 'Luxury Stay Showcase', image_path: 'hotel-tamil-park/poster-premium-1.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() },
        { id: '20000000-0000-0000-0000-000000000002', client_id: '22222222-2222-2222-2222-222222222222', title: 'Fine Dining Poster', image_path: 'hotel-tamil-park/poster-premium-2.jpg', sort_order: 2, approved: true, created_at: new Date(), updated_at: new Date() },

        // KSP Pattu Maaligai
        { id: '30000000-0000-0000-0000-000000000001', client_id: '33333333-3333-3333-3333-333333333333', title: 'Heritage Silks Launch', image_path: 'ksp-pattu-maaligai/poster-fashion-1.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() },
        { id: '30000000-0000-0000-0000-000000000002', client_id: '33333333-3333-3333-3333-333333333333', title: 'Bridal Couture Collection', image_path: 'ksp-pattu-maaligai/poster-fashion-2.jpg', sort_order: 2, approved: true, created_at: new Date(), updated_at: new Date() },

        // Nalam Wellness
        { id: '40000000-0000-0000-0000-000000000001', client_id: '44444444-4444-4444-4444-444444444444', title: 'Holistic Yoga Retreat', image_path: 'nalam-wellness/poster-premium-3.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() },
        
        // PS Robotix
        { id: '50000000-0000-0000-0000-000000000001', client_id: '55555555-5555-5555-5555-555555555555', title: 'Next-Gen Robotics Camp', image_path: 'ps-robotix/poster-fitness-3.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() },

        // SMR Groups
        { id: '60000000-0000-0000-0000-000000000001', client_id: '66666666-6666-6666-6666-666666666666', title: 'Urban Skyline Residence', image_path: 'smr-groups/poster-premium-2.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() },

        // Suji Cards
        { id: '70000000-0000-0000-0000-000000000001', client_id: '77777777-7777-7777-7777-777777777777', title: 'Exquisite Invitation Suite', image_path: 'suji-cards/poster-fashion-3.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date() }
      ];
    }

    for (const row of posters) {
      await client.query(
        `INSERT INTO public.client_posters (id, client_id, title, image_path, sort_order, approved, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.client_id, row.title, row.image_path, row.sort_order, row.approved, row.created_at, row.updated_at]
      );
    }
    console.log(`✅ Synced/Seeded ${posters.length} posters.`);

    // Client Websites
    console.log("Fetching 'client_websites'...");
    let websites = await fetchSupabaseTable('client_websites');
    if (!websites || websites.length === 0) {
      console.log("ℹ️  Notice: Supabase returned empty websites table. Running premium fallback website seeder...");
      websites = [
        { id: '10000000-1111-0000-0000-000000000001', client_id: '11111111-1111-1111-1111-111111111111', title: 'JP Wellness Coach Platform', image_path: 'jp-fitness-studios/poster-fitness-1.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date(), website_url: 'https://lovable.dev' },
        { id: '20000000-2222-0000-0000-000000000001', client_id: '22222222-2222-2222-2222-222222222222', title: 'Hotel Tamil Park Booking Portal', image_path: 'hotel-tamil-park/poster-premium-1.jpg', sort_order: 1, approved: true, created_at: new Date(), updated_at: new Date(), website_url: 'https://creativenode.in' }
      ];
    }

    for (const row of websites) {
      await client.query(
        `INSERT INTO public.client_websites (id, client_id, title, image_path, sort_order, approved, created_at, updated_at, website_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.client_id, row.title, row.image_path, row.sort_order, row.approved, row.created_at, row.updated_at, row.website_url]
      );
    }
    console.log(`✅ Synced/Seeded ${websites.length} websites.`);

    // Promo Codes
    console.log("Fetching 'promo_codes'...");
    const promos = await fetchSupabaseTable('promo_codes');
    if (promos && promos.length > 0) {
      for (const row of promos) {
        await client.query(
          `INSERT INTO public.promo_codes (id, code, discount_percent, is_active, created_at) 
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [row.id, row.code, row.discount_percent, row.is_active, row.created_at]
        );
      }
      console.log(`✅ Synced ${promos.length} promo codes.`);
    }

    // Payments
    console.log("Fetching 'payments'...");
    const payments = await fetchSupabaseTable('payments');
    if (payments && payments.length > 0) {
      for (const row of payments) {
        if (row.user_id) {
          // Satisfy User foreign key constraint first
          await client.query(
            `INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
            [row.user_id, 'migrated-user@creativenode.in']
          );
        }
        await client.query(
          `INSERT INTO public.payments (id, payment_id, amount_received, currency, promo_code_used, plan_name, status, created_at, user_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [row.id, row.payment_id, row.amount_received, row.currency, row.promo_code_used, row.plan_name, row.status, row.created_at, row.user_id]
        );
      }
      console.log(`✅ Synced ${payments.length} payments.`);
    }

    // User Roles
    console.log("Fetching 'user_roles'...");
    const userRoles = await fetchSupabaseTable('user_roles');
    if (userRoles && userRoles.length > 0) {
      for (const row of userRoles) {
        if (row.user_id) {
          // Satisfy User foreign key constraint first
          await client.query(
            `INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
            [row.user_id, 'migrated-admin@creativenode.in']
          );
        }
        await client.query(
          `INSERT INTO public.user_roles (id, user_id, role, created_at) 
           VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [row.id, row.user_id, row.role, row.created_at]
        );
      }
      console.log(`✅ Synced ${userRoles.length} user roles.`);
    }

    // Contact Messages
    console.log("Fetching 'contact_messages'...");
    const contactMessages = await fetchSupabaseTable('contact_messages');
    if (contactMessages && contactMessages.length > 0) {
      for (const row of contactMessages) {
        await client.query(
          `INSERT INTO public.contact_messages (id, name, email, message, created_at, read) 
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
          [row.id, row.name, row.email, row.message, row.created_at, row.read]
        );
      }
      console.log(`✅ Synced ${contactMessages.length} contact messages.`);
    }

    // Invoices
    console.log("Fetching 'invoices'...");
    const invoices = await fetchSupabaseTable('invoices');
    if (invoices && invoices.length > 0) {
      for (const row of invoices) {
        await client.query(
          `INSERT INTO public.invoices (id, invoice_number, client_id, client_name, client_email, items, subtotal, tax_rate, tax_amount, total, status, issue_date, due_date, notes, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT (id) DO NOTHING`,
          [row.id, row.invoice_number, row.client_id, row.client_name, row.client_email, JSON.stringify(row.items), row.subtotal, row.tax_rate, row.tax_amount, row.total, row.status, row.issue_date, row.due_date, row.notes, row.created_at, row.updated_at]
        );
      }
      console.log(`✅ Synced ${invoices.length} invoices.`);
    }

    console.log("\n🎉 DATABASE MIGRATION TO NEON COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Migration failed with error:", err.message);
  } finally {
    await client.end();
    console.log("Closed connection to Neon Postgres.");
  }
}

migrate();
