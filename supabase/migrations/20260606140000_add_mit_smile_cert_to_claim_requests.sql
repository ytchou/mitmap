alter table public.claim_requests
  add column if not exists mit_smile_cert text;

comment on column public.claim_requests.mit_smile_cert is
  'Optional MIT 微笑標章 (MIT Smile) mark number submitted by the claimant; admin verifies against the registry.';
