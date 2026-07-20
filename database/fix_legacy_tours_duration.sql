-- =========================================================
-- TravelGo - Fix para bases antiguas con tours.duracion_dias
-- Ejecutar si Supabase muestra:
-- "null value in column duracion_dias of relation tours"
-- =========================================================

alter table public.tours
    add column if not exists duracion integer default 1;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'tours'
          and column_name = 'duracion_dias'
    ) then
        alter table public.tours
            alter column duracion_dias set default 1;

        update public.tours
        set duracion = coalesce(duracion, duracion_dias, 1)
        where duracion is null or duracion <= 0;

        update public.tours
        set duracion_dias = coalesce(duracion_dias, duracion, 1)
        where duracion_dias is null or duracion_dias <= 0;

        execute $sql$
            create or replace function public.sync_tours_duration_columns()
            returns trigger
            language plpgsql
            as $fn$
            begin
                if new.duracion is null or new.duracion <= 0 then
                    new.duracion := coalesce(new.duracion_dias, 1);
                end if;

                if new.duracion_dias is null or new.duracion_dias <= 0 then
                    new.duracion_dias := coalesce(new.duracion, 1);
                end if;

                return new;
            end;
            $fn$;
        $sql$;

        drop trigger if exists sync_tours_duration_columns on public.tours;

        create trigger sync_tours_duration_columns
            before insert or update on public.tours
            for each row
            execute function public.sync_tours_duration_columns();
    end if;
end $$;

notify pgrst, 'reload schema';
