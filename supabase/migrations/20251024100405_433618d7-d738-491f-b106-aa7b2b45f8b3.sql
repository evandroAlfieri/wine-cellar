-- Add created_at column to bottle table for proper ordering
ALTER TABLE public.bottle 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create index for better performance on ordering
CREATE INDEX idx_bottle_created_at ON public.bottle(created_at DESC);