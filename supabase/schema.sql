-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  blockchain_id INTEGER NOT NULL,
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  cost DECIMAL NOT NULL,
  raised DECIMAL NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  backers_count INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 0,
  has_milestones BOOLEAN NOT NULL DEFAULT false,
  milestone_count INTEGER NOT NULL DEFAULT 0,
  milestones_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create unique index on blockchain_id
CREATE UNIQUE INDEX IF NOT EXISTS projects_blockchain_id_idx ON projects (blockchain_id);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  blockchain_id INTEGER NOT NULL,
  project_blockchain_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  yes_votes INTEGER NOT NULL DEFAULT 0,
  no_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_blockchain_id) REFERENCES projects (blockchain_id) ON DELETE CASCADE
);

-- Create unique index on project_blockchain_id and blockchain_id
CREATE UNIQUE INDEX IF NOT EXISTS milestones_project_blockchain_id_blockchain_id_idx ON milestones (project_blockchain_id, blockchain_id);

-- Create backers table
CREATE TABLE IF NOT EXISTS backers (
  id SERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  project_blockchain_id INTEGER NOT NULL,
  refunded BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  contribution DECIMAL NOT NULL,
  FOREIGN KEY (project_blockchain_id) REFERENCES projects (blockchain_id) ON DELETE CASCADE
);

-- Create unique index on project_blockchain_id and owner
CREATE UNIQUE INDEX IF NOT EXISTS backers_project_blockchain_id_owner_idx ON backers (project_blockchain_id, owner);

-- Create RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE backers ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Allow public read access to projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow project owners to update their projects" ON projects
  FOR UPDATE USING (owner = auth.uid()::text);

-- Milestones policies
CREATE POLICY "Allow public read access to milestones" ON milestones
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create milestones" ON milestones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow project owners to update milestones" ON milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.blockchain_id = milestones.project_blockchain_id
      AND projects.owner = auth.uid()::text
    )
  );

-- Backers policies
CREATE POLICY "Allow public read access to backers" ON backers
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create backers" ON backers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow backers to update their own records" ON backers
  FOR UPDATE USING (owner = auth.uid()::text);

-- Create storage bucket for project images

-- Set up storage policies
CREATE POLICY "Allow public read access to project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Allow authenticated users to upload project images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow project owners to update their project images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
