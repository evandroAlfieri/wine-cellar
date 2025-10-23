-- Add UPDATE policy for wine table
CREATE POLICY "Authenticated users can update wines"
ON public.wine
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);