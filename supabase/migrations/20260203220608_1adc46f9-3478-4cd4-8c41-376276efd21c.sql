-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'provider');

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('reboque', 'chaveiro', 'borracheiro', 'destombamento', 'frete_pequeno', 'frete_grande');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create providers table for service provider specific data
CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    services service_type[] NOT NULL DEFAULT '{}',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    total_jobs INTEGER NOT NULL DEFAULT 0,
    accepted_jobs INTEGER NOT NULL DEFAULT 0,
    total_ratings INTEGER NOT NULL DEFAULT 0,
    rating_sum INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC(2,1) NOT NULL DEFAULT 0.0,
    response_time_avg INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_requests table
CREATE TABLE public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    service_type service_type NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    vehicle_info TEXT,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    rating_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers and admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'provider') OR 
    public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for providers
CREATE POLICY "Anyone can view approved providers"
ON public.providers FOR SELECT
TO authenticated
USING (is_approved = true);

CREATE POLICY "Providers can view their own profile"
ON public.providers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile"
ON public.providers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create provider profile"
ON public.providers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all providers"
ON public.providers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service_requests
CREATE POLICY "Clients can view their own requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'));

CREATE POLICY "Clients can update their own requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Approved providers can view pending requests in their area"
ON public.service_requests FOR SELECT
TO authenticated
USING (
    status = 'pending' AND
    public.has_role(auth.uid(), 'provider') AND
    EXISTS (
        SELECT 1 FROM public.providers 
        WHERE user_id = auth.uid() 
        AND is_approved = true
    )
);

CREATE POLICY "Providers can view their accepted requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (
    provider_id IN (
        SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Providers can update requests they accepted"
ON public.service_requests FOR UPDATE
TO authenticated
USING (
    provider_id IN (
        SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all requests"
ON public.service_requests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_providers_updated_at
BEFORE UPDATE ON public.providers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update provider stats
CREATE OR REPLACE FUNCTION public.update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- When a request is completed with a rating
    IF NEW.status = 'completed' AND NEW.rating IS NOT NULL AND OLD.rating IS NULL THEN
        UPDATE public.providers
        SET 
            total_ratings = total_ratings + 1,
            rating_sum = rating_sum + NEW.rating,
            average_rating = ROUND((rating_sum + NEW.rating)::NUMERIC / (total_ratings + 1), 1)
        WHERE id = NEW.provider_id;
    END IF;
    
    -- When a request is accepted
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        UPDATE public.providers
        SET 
            accepted_jobs = accepted_jobs + 1,
            total_jobs = total_jobs + 1
        WHERE id = NEW.provider_id;
    END IF;
    
    -- When a request is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Calculate response time if accepted_at exists
        IF NEW.accepted_at IS NOT NULL THEN
            UPDATE public.providers
            SET response_time_avg = COALESCE(
                (response_time_avg * (total_jobs - 1) + 
                EXTRACT(EPOCH FROM (NEW.accepted_at - NEW.created_at))::INTEGER) / total_jobs,
                0
            )
            WHERE id = NEW.provider_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for provider stats
CREATE TRIGGER update_provider_stats_trigger
AFTER UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.update_provider_stats();

-- Enable realtime for service_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;