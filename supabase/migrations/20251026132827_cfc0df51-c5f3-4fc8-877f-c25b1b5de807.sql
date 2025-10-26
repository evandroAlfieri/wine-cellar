-- Add UPDATE policy for producer table so producers can be updated with country/region info
CREATE POLICY "Authenticated users can update producers" 
ON public.producer 
FOR UPDATE 
USING (true)
WITH CHECK (true);