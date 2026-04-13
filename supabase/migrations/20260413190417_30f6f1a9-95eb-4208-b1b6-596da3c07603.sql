
-- Add client_segment and is_approved columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_segment text,
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Add company-related fields for B2B and B2C segments
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_cnpj text,
ADD COLUMN IF NOT EXISTS employee_id text;

-- Update handle_new_user to save client_segment and company fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_role app_role;
BEGIN
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::app_role, 
        'client'
    );
    
    INSERT INTO public.profiles (user_id, full_name, phone, client_segment, company_name, company_cnpj, employee_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.raw_user_meta_data->>'client_segment',
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'company_cnpj',
        NEW.raw_user_meta_data->>'employee_id'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role);
    
    IF user_role = 'provider' THEN
        INSERT INTO public.providers (user_id)
        VALUES (NEW.id);
    END IF;
    
    IF NEW.email = 'mayckhammer@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$;
