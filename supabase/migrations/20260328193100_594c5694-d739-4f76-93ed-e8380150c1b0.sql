
-- Update handle_new_user to also assign admin role for specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_role app_role;
BEGIN
    -- Get role from metadata or default to 'client'
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::app_role, 
        'client'
    );
    
    -- Create profile
    INSERT INTO public.profiles (user_id, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
    
    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role);
    
    -- If provider, create provider record
    IF user_role = 'provider' THEN
        INSERT INTO public.providers (user_id)
        VALUES (NEW.id);
    END IF;
    
    -- Auto-assign admin role for specific admin email
    IF NEW.email = 'mayckhammer@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$;
