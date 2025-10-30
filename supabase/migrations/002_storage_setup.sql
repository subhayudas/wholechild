-- Storage buckets for file uploads
-- Create storage buckets for media files

-- Activity media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-media', 'activity-media', true)
ON CONFLICT (id) DO NOTHING;

-- Learning story media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-story-media', 'learning-story-media', true)
ON CONFLICT (id) DO NOTHING;

-- Therapy session recordings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('therapy-recordings', 'therapy-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Public uploads bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-uploads', 'public-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public access
CREATE POLICY "Public Access for activity-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-media');

CREATE POLICY "Authenticated users can upload to activity-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'activity-media' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access for learning-story-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-story-media');

CREATE POLICY "Authenticated users can upload to learning-story-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-story-media' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access for therapy-recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'therapy-recordings');

CREATE POLICY "Authenticated users can upload to therapy-recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'therapy-recordings' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access for public-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-uploads');

CREATE POLICY "Authenticated users can upload to public-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-uploads' AND auth.role() = 'authenticated');



