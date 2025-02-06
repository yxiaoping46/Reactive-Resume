-- Create health check function
create or replace function health_check()
returns boolean
language plpgsql
security definer
as $$
begin
  -- Simple query to check if the database is responsive
  perform 1;
  return true;
exception
  when others then
    return false;
end;
$$; 