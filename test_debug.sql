CREATE OR REPLACE FUNCTION public.test_debug_fils()
RETURNS JSON AS $$
DECLARE
  v_old_fils INTEGER;
  v_new_fils INTEGER;
BEGIN
  -- We assume auth.uid() is not null, but since we call it from node, maybe we need a param
  RETURN json_build_object('msg', 'hello');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
