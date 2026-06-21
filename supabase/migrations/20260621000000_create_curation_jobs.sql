CREATE TABLE IF NOT EXISTS public.curation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'running', 'completed', 'failed')
    ),
    params JSONB DEFAULT '{}'::jsonb,
    dry_run BOOLEAN NOT NULL DEFAULT true,
    progress JSONB DEFAULT '{}'::jsonb,
    result JSONB,
    started_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_curation_jobs_status_created_at
ON public.curation_jobs (status, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS curation_jobs_single_running
ON public.curation_jobs (status)
WHERE status = 'running';

ALTER TABLE public.curation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_select_curation_jobs
ON public.curation_jobs
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY service_role_insert_curation_jobs
ON public.curation_jobs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY service_role_update_curation_jobs
ON public.curation_jobs
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
