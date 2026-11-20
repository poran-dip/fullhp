-- A nullable array keeps the legacy route deployable during backfill.
ALTER TABLE doctors ADD COLUMN medbot_embedding double precision[];
CREATE FUNCTION invalidate_medbot_embedding() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (OLD.department, OLD.specialization) IS DISTINCT FROM (NEW.department, NEW.specialization) THEN
    NEW.medbot_embedding := NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER medbot_profile_changed BEFORE UPDATE OF department, specialization ON doctors
FOR EACH ROW EXECUTE FUNCTION invalidate_medbot_embedding();
