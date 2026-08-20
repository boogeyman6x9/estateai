-- EstateAI: 0013_rate_limiting
--
-- Backs rate limiting for the public /api/chat endpoint. A single-row-per-key
-- fixed-window counter, reset atomically inside the UPSERT itself — no cron
-- cleanup needed, and safe under concurrent serverless invocations because
-- the whole read-modify-write happens under Postgres's own row lock.

create table rate_limit_counters (
  bucket_key text primary key,
  window_start timestamptz not null,
  count int not null default 0
);

create or replace function check_rate_limit(
  p_key text,
  p_window_seconds int,
  p_max_requests int
)
returns boolean -- true = allowed, false = over the limit
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into rate_limit_counters (bucket_key, window_start, count)
  values (p_key, now(), 1)
  on conflict (bucket_key) do update
    set count = case
        when rate_limit_counters.window_start < now() - (p_window_seconds || ' seconds')::interval
          then 1
        else rate_limit_counters.count + 1
      end,
      window_start = case
        when rate_limit_counters.window_start < now() - (p_window_seconds || ' seconds')::interval
          then now()
        else rate_limit_counters.window_start
      end
  returning count into v_count;

  return v_count <= p_max_requests;
end;
$$;

comment on function check_rate_limit is 'Fixed-window rate limiter. Call with a unique bucket key (e.g. "chat:1.2.3.4"); returns false once the count in the current window exceeds p_max_requests.';
