-- Vision Center Khouane — Supabase schema
-- Run this in: Supabase Dashboard > SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── SERVICES ──────────────────────────────────────────────
CREATE TABLE services (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr        TEXT NOT NULL,
  name_ar        TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  icon           TEXT NOT NULL DEFAULT 'Eye',
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CATALOG PRODUCTS ──────────────────────────────────────
CREATE TABLE catalog_products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('frames','lenses','sunglasses')),
  brand          TEXT NOT NULL,
  price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url      TEXT,
  image_path     TEXT,
  description_fr TEXT,
  description_ar TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalog_category ON catalog_products(category);
CREATE INDEX idx_catalog_brand    ON catalog_products(brand);
CREATE INDEX idx_catalog_active   ON catalog_products(is_active);

-- ── APPOINTMENTS ──────────────────────────────────────────
CREATE TABLE appointments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name      TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  reason         TEXT,
  locale         TEXT NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr','ar')),
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','completed','cancelled')),
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appt_status ON appointments(status);
CREATE INDEX idx_appt_date   ON appointments(preferred_date);

-- ── TESTIMONIALS ──────────────────────────────────────────
CREATE TABLE testimonials (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name    TEXT NOT NULL,
  rating         INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  body_fr        TEXT NOT NULL,
  body_ar        TEXT,
  source         TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('google','manual')),
  google_id      TEXT UNIQUE,
  is_visible     BOOLEAN NOT NULL DEFAULT true,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SITE CONTENT ──────────────────────────────────────────
CREATE TABLE site_content (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key   TEXT NOT NULL UNIQUE,
  value_fr      TEXT,
  value_ar      TEXT,
  value_numeric NUMERIC,
  content_type  TEXT NOT NULL DEFAULT 'text'
                  CHECK (content_type IN ('text','number','richtext')),
  label         TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_content (content_key, content_type, label, value_fr, value_ar, value_numeric) VALUES
  ('hero_title',     'text',   'Titre Hero',        'Votre vision, notre priorité', 'رؤيتك، أولويتنا', NULL),
  ('hero_subtitle',  'text',   'Sous-titre Hero',   'Centre optique professionnel à Bir El Djir, Oran', 'مركز بصريات متخصص في بئر الجير، وهران', NULL),
  ('about_title',    'text',   'Titre À propos',    'Dédié à votre santé visuelle', 'مكرّس لصحتك البصرية', NULL),
  ('about_body',     'richtext','Corps À propos',   'Depuis plus de 10 ans, Vision Center Khouane vous offre des soins visuels de qualité. Notre équipe est là pour vous accompagner à chaque étape de votre parcours optique.', 'منذ أكثر من 10 سنوات، يقدم مركز خوان للبصريات رعاية بصرية عالية الجودة. فريقنا هنا لمرافقتك في كل خطوة من رحلتك البصرية.', NULL),
  ('stat_years',     'number', 'Stat: Années',      NULL, NULL, 10),
  ('stat_patients',  'number', 'Stat: Patients',    NULL, NULL, 2000),
  ('stat_frames',    'number', 'Stat: Montures',    NULL, NULL, 200),
  ('stat_services',  'number', 'Stat: Services',    NULL, NULL, 6),
  ('contact_phone',  'text',   'Téléphone',         '+213 674 08 81 58', NULL, NULL),
  ('contact_whatsapp','text',  'WhatsApp',          '+213674088158', NULL, NULL),
  ('contact_address','text',   'Adresse',           'W32, Bir El Djir, Oran, Algérie', 'و32، بئر الجير، وهران، الجزائر', NULL),
  ('hours_sat_wed',  'text',   'Horaires Sam–Mer',  '9h00 – 19h00', '09:00 – 19:00', NULL),
  ('hours_thu',      'text',   'Horaires Jeudi',    '9h00 – 17h00', '09:00 – 17:00', NULL),
  ('hours_fri',      'text',   'Horaires Vendredi', 'Fermé', 'مغلق', NULL);

-- ── API KEYS ──────────────────────────────────────────────
CREATE TABLE api_keys (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  key_hash     TEXT NOT NULL UNIQUE,
  key_prefix   TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_services_updated    BEFORE UPDATE ON services    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_catalog_updated     BEFORE UPDATE ON catalog_products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys         ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "public_read_services"     ON services         FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_catalog"      ON catalog_products FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_testimonials" ON testimonials     FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_site_content" ON site_content     FOR SELECT USING (true);
CREATE POLICY "public_insert_appointments" ON appointments   FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated role)
CREATE POLICY "admin_all_services"      ON services         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_catalog"       ON catalog_products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_appointments"  ON appointments     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_testimonials"  ON testimonials     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_site_content"  ON site_content     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_api_keys"      ON api_keys         FOR ALL USING (auth.role() = 'authenticated');

-- ── STORAGE BUCKET ────────────────────────────────────────
-- Run separately in Supabase Dashboard > Storage, or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('catalog-images', 'catalog-images', true);

-- ── SEED SERVICES ─────────────────────────────────────────
INSERT INTO services (name_fr, name_ar, description_fr, description_ar, icon, display_order) VALUES
  ('Examen de la vue',     'فحص النظر',         'Bilan visuel complet avec équipements modernes.',                      'فحص بصري شامل باستخدام أجهزة حديثة.',            'Eye',        1),
  ('Lunettes de vue',      'نظارات طبية',        'Large choix de montures pour tous les styles et budgets.',             'مجموعة واسعة من الإطارات لجميع الأذواق والميزانيات.','Glasses',    2),
  ('Lentilles de contact', 'العدسات اللاصقة',    'Lentilles journalières, mensuelles et spécialisées.',                  'عدسات يومية وشهرية ومتخصصة.',                    'Contact2',   3),
  ('Lunettes de soleil',   'النظارات الشمسية',   'Protection UV optimale, avec ou sans correction.',                     'حماية مثلى من الأشعة فوق البنفسجية، مع أو بدون تصحيح.','Sun',      4),
  ('Réparations',          'الإصلاحات',          'Ajustements et réparations rapides de montures.',                      'تعديلات وإصلاحات سريعة للإطارات.',               'Wrench',     5),
  ('Vision pédiatrique',   'بصريات الأطفال',     'Examens adaptés aux enfants dans un environnement bienveillant.',      'فحوصات مخصصة للأطفال في بيئة ودية.',             'Baby',       6);

-- ── SEED TESTIMONIALS ─────────────────────────────────────
INSERT INTO testimonials (author_name, rating, body_fr, body_ar, source, display_order) VALUES
  ('Amira B.', 5, 'Service excellent et très professionnel. Mes lunettes étaient prêtes le jour même avec une correction parfaite. Je recommande vivement !', 'خدمة ممتازة واحترافية للغاية. نظارتي كانت جاهزة في نفس اليوم مع تصحيح مثالي. أوصي بشدة!', 'manual', 1),
  ('Karim M.', 5, 'L'opticien a pris le temps de tout expliquer clairement. Excellent choix de montures à tous les prix. Je reviendrai sans hésiter.', 'أخذ البصري وقته لشرح كل شيء بوضوح. اختيار رائع من الإطارات بجميع الأسعار. سأعود بكل تأكيد.', 'manual', 2),
  ('Fatima Z.', 4, 'Personnel très compétent et bienveillant. Mes enfants se sont sentis à l'aise lors de leur examen de vue. Expérience merveilleuse !', 'طاقم عمل كفء وودود للغاية. شعر أطفالي بالراحة التامة أثناء فحص نظرهم. تجربة رائعة!', 'manual', 3);
