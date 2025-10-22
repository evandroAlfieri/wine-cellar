-- Add INSERT/UPDATE/DELETE policies for authenticated users
CREATE POLICY "Authenticated users can insert countries"
ON public.country
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete countries"
ON public.country
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert producers"
ON public.producer
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete producers"
ON public.producer
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert wines"
ON public.wine
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete wines"
ON public.wine
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert bottles"
ON public.bottle
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update bottles"
ON public.bottle
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bottles"
ON public.bottle
FOR DELETE
TO authenticated
USING (true);