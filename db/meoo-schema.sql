CREATE TABLE IF NOT EXISTS public.portfolio (id integer PRIMARY KEY CHECK(id=1),data jsonb NOT NULL,revision integer NOT NULL DEFAULT 0,updated_by text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.site_intro (id integer PRIMARY KEY CHECK(id=1),data jsonb NOT NULL,revision integer NOT NULL DEFAULT 0,updated_by text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.site_footer (id integer PRIMARY KEY CHECK(id=1),data jsonb NOT NULL,revision integer NOT NULL DEFAULT 0,updated_by text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_intro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_footer ENABLE ROW LEVEL SECURITY;
-- No anonymous policies; only the server service-role key may access these tables.
