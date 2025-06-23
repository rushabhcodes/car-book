-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('car-images', 'car-images', true),
  ('car-videos', 'car-videos', true),
  ('car-audio', 'car-audio', false);

-- Storage policies for car-images bucket
CREATE POLICY "Anyone can view car images" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload car images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'car-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own car images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'car-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own car images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'car-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for car-videos bucket
CREATE POLICY "Anyone can view car videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-videos');

CREATE POLICY "Authenticated users can upload car videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'car-videos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own car videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'car-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own car videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'car-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for car-audio bucket (private)
CREATE POLICY "Users can view their own car audio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'car-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can upload car audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'car-audio' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own car audio" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'car-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own car audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'car-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
