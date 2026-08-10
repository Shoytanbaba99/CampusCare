-- Supabase Storage Bucket Migration for Complaint Evidence
-- Storage Bucket: `complaint-evidence`

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'complaint-evidence',
    'complaint-evidence',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies
CREATE POLICY "Authenticated users can view complaint evidence photos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'complaint-evidence');

CREATE POLICY "Students can upload complaint evidence photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
