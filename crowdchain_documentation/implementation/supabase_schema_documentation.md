# Supabase Schema Documentation for CrowdChain

## Introduction

This document provides comprehensive documentation for implementing the CrowdChain database schema in Supabase. CrowdChain is a crowdfunding platform that allows users to create projects with milestone-based funding, where backers can contribute to projects and vote on milestone completions. The schema includes core functionality for projects, milestones, and backers, as well as administrative features for platform management.

The database schema is designed to:
1. Support transparent milestone-based crowdfunding
2. Enable administrative oversight and moderation
3. Provide support ticket management
4. Track platform analytics
5. Ensure data integrity through proper relationships and constraints

This documentation includes SQL statements for creating all necessary tables, explanations of relationships, and guidance for implementing Supabase-specific features like row-level security.

## Table Definitions

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    username TEXT NOT NULL UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for faster user lookups
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" 
    ON users FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON users FOR UPDATE 
    USING (auth.uid()::text = address);
```

#### Projects Table

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    hash_value TEXT,
    target_amount DECIMAL NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    backer_count INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0,
    has_milestones BOOLEAN DEFAULT true NOT NULL,
    milestone_count INTEGER DEFAULT 0,
    milestone_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    admin_approved BOOLEAN DEFAULT false,
    admin_approved_by INTEGER REFERENCES admins(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    featured BOOLEAN DEFAULT false,
    featured_by INTEGER REFERENCES admins(id),
    featured_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(address)
        ON DELETE CASCADE
);

-- Indexes for faster project lookups
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_admin_approved ON projects(admin_approved);

-- Enable row level security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view approved projects" 
    ON projects FOR SELECT 
    USING (admin_approved = true);

CREATE POLICY "Project owners can view their own projects" 
    ON projects FOR SELECT 
    USING (auth.uid()::text = owner_id);

CREATE POLICY "Project owners can update their own projects" 
    ON projects FOR UPDATE 
    USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can create projects" 
    ON projects FOR INSERT 
    WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Admins can view all projects" 
    ON projects FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can update all projects" 
    ON projects FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));
```

#### Milestones Table

```sql
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    yes_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status INTEGER DEFAULT 0,
    admin_reviewed BOOLEAN DEFAULT false,
    admin_reviewed_by INTEGER REFERENCES admins(id),
    admin_reviewed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_project
        FOREIGN KEY(project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Indexes for faster milestone lookups
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);

-- Enable row level security
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view milestones of approved projects" 
    ON milestones FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = milestones.project_id 
        AND projects.admin_approved = true
    ));

CREATE POLICY "Project owners can manage their project milestones" 
    ON milestones FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = milestones.project_id 
        AND projects.owner_id = auth.uid()::text
    ));

CREATE POLICY "Admins can view all milestones" 
    ON milestones FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can update all milestones" 
    ON milestones FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));
```

#### Backers Table

```sql
CREATE TABLE backers (
    id SERIAL PRIMARY KEY,
    owner_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    transaction_hash TEXT NOT NULL,
    contribution DECIMAL NOT NULL,
    flagged BOOLEAN DEFAULT false,
    flagged_reason TEXT,
    flagged_by INTEGER REFERENCES admins(id),
    flagged_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(address)
        ON DELETE CASCADE,
    CONSTRAINT fk_project
        FOREIGN KEY(project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Indexes for faster backer lookups
CREATE INDEX idx_backers_owner ON backers(owner_id);
CREATE INDEX idx_backers_project ON backers(project_id);
CREATE INDEX idx_backers_flagged ON backers(flagged);

-- Enable row level security
ALTER TABLE backers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view backers of approved projects" 
    ON backers FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = backers.project_id 
        AND projects.admin_approved = true
    ));

CREATE POLICY "Users can create backer records" 
    ON backers FOR INSERT 
    WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Backers can view their own contributions" 
    ON backers FOR SELECT 
    USING (auth.uid()::text = owner_id);

CREATE POLICY "Admins can view all backers" 
    ON backers FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can update backer records" 
    ON backers FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));
```

### Administrative Tables

#### Admins Table

```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions JSONB NOT NULL,
    last_login_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL
);

-- Index for faster admin lookups
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(active);

-- Enable row level security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view admin profiles" 
    ON admins FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Super admins can manage admin profiles" 
    ON admins FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email() 
        AND admins.role = 'super_admin'
    ));
```

#### AdminActions Table

```sql
CREATE TABLE admin_actions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_admin
        FOREIGN KEY(admin_id)
        REFERENCES admins(id)
        ON DELETE CASCADE
);

-- Indexes for faster admin action lookups
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_entity ON admin_actions(entity_type, entity_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);

-- Enable row level security
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view admin actions" 
    ON admin_actions FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "System can insert admin actions" 
    ON admin_actions FOR INSERT 
    WITH CHECK (true);
```

#### PlatformSettings Table

```sql
CREATE TABLE platform_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT NOT NULL,
    updated_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_admin
        FOREIGN KEY(updated_by)
        REFERENCES admins(id)
        ON DELETE CASCADE
);

-- Index for faster settings lookups
CREATE INDEX idx_platform_settings_key ON platform_settings(setting_key);

-- Enable row level security
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view platform settings" 
    ON platform_settings FOR SELECT 
    USING (true);

CREATE POLICY "Admins can update platform settings" 
    ON platform_settings FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can insert platform settings" 
    ON platform_settings FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));
```

#### SupportTickets Table

```sql
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    user_address TEXT NOT NULL,
    user_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    project_id INTEGER,
    transaction_hash TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    assigned_to INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_user
        FOREIGN KEY(user_address)
        REFERENCES users(address)
        ON DELETE CASCADE,
    CONSTRAINT fk_project
        FOREIGN KEY(project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_admin
        FOREIGN KEY(assigned_to)
        REFERENCES admins(id)
        ON DELETE SET NULL
);

-- Indexes for faster ticket lookups
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_address);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_project ON support_tickets(project_id);

-- Enable row level security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tickets" 
    ON support_tickets FOR SELECT 
    USING (auth.uid()::text = user_address);

CREATE POLICY "Users can create support tickets" 
    ON support_tickets FOR INSERT 
    WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Admins can view all tickets" 
    ON support_tickets FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can update tickets" 
    ON support_tickets FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));
```

#### TicketMessages Table

```sql
CREATE TABLE ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL,
    sender_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_ticket
        FOREIGN KEY(ticket_id)
        REFERENCES support_tickets(id)
        ON DELETE CASCADE
);

-- Indexes for faster message lookups
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_sender ON ticket_messages(sender_id, sender_type);

-- Enable row level security
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view messages for their tickets" 
    ON ticket_messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE support_tickets.id = ticket_messages.ticket_id 
        AND support_tickets.user_address = auth.uid()::text
    ));

CREATE POLICY "Users can add messages to their tickets" 
    ON ticket_messages FOR INSERT 
    WITH CHECK (
        sender_id = auth.uid()::text 
        AND sender_type = 'user' 
        AND EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_messages.ticket_id 
            AND support_tickets.user_address = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all ticket messages" 
    ON ticket_messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can add messages to tickets" 
    ON ticket_messages FOR INSERT 
    WITH CHECK (
        sender_type = 'admin' 
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id::text = sender_id 
            AND admins.email = auth.email()
        )
    );
```

#### TicketAttachments Table

```sql
CREATE TABLE ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL,
    message_id INTEGER,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_ticket
        FOREIGN KEY(ticket_id)
        REFERENCES support_tickets(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_message
        FOREIGN KEY(message_id)
        REFERENCES ticket_messages(id)
        ON DELETE CASCADE
);

-- Indexes for faster attachment lookups
CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_message ON ticket_attachments(message_id);

-- Enable row level security
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view attachments for their tickets" 
    ON ticket_attachments FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE support_tickets.id = ticket_attachments.ticket_id 
        AND support_tickets.user_address = auth.uid()::text
    ));

CREATE POLICY "Users can add attachments to their tickets" 
    ON ticket_attachments FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE support_tickets.id = ticket_attachments.ticket_id 
        AND support_tickets.user_address = auth.uid()::text
    ));

CREATE POLICY "Admins can view all ticket attachments" 
    ON ticket_attachments FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "Admins can add attachments to tickets" 
    ON ticket_attachments FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));
```

#### AnalyticsAggregates Table

```sql
CREATE TABLE analytics_aggregates (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    time_period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_metric_period
        UNIQUE(metric_name, time_period, start_date, end_date)
);

-- Indexes for faster analytics lookups
CREATE INDEX idx_analytics_metric ON analytics_aggregates(metric_name);
CREATE INDEX idx_analytics_period ON analytics_aggregates(time_period);
CREATE INDEX idx_analytics_dates ON analytics_aggregates(start_date, end_date);

-- Enable row level security
ALTER TABLE analytics_aggregates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view analytics" 
    ON analytics_aggregates FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.email = auth.email()
    ));

CREATE POLICY "System can insert analytics" 
    ON analytics_aggregates FOR INSERT 
    WITH CHECK (true);
```

## Relationships Between Tables

The CrowdChain database schema implements several key relationships to maintain data integrity and support the platform's functionality:

### Core Relationships

1. **Users to Projects (One-to-Many)**
   - A user can create multiple projects
   - Implemented via the `owner_id` foreign key in the Projects table referencing the Users table

2. **Projects to Milestones (One-to-Many)**
   - A project can have multiple milestones
   - Implemented via the `project_id` foreign key in the Milestones table referencing the Projects table

3. **Projects to Backers (One-to-Many)**
   - A project can have multiple backers
   - Implemented via the `project_id` foreign key in the Backers table referencing the Projects table

4. **Users to Backers (One-to-Many)**
   - A user can back multiple projects
   - Implemented via the `owner_id` foreign key in the Backers table referencing the Users table

### Administrative Relationships

1. **Admins to Projects (One-to-Many)**
   - Admins can approve and feature projects
   - Implemented via the `admin_approved_by` and `featured_by` foreign keys in the Projects table referencing the Admins table

2. **Admins to Milestones (One-to-Many)**
   - Admins can review milestones
   - Implemented via the `admin_reviewed_by` foreign key in the Milestones table referencing the Admins table

3. **Admins to Backers (One-to-Many)**
   - Admins can flag suspicious backer contributions
   - Implemented via the `flagged_by` foreign key in the Backers table referencing the Admins table

4. **Admins to AdminActions (One-to-Many)**
   - All admin actions are logged for auditing
   - Implemented via the `admin_id` foreign key in the AdminActions table referencing the Admins table

5. **Admins to PlatformSettings (One-to-Many)**
   - Admins can update platform settings
   - Implemented via the `updated_by` foreign key in the PlatformSettings table referencing the Admins table

6. **Admins to SupportTickets (One-to-Many)**
   - Support tickets can be assigned to admins
   - Implemented via the `assigned_to` foreign key in the SupportTickets table referencing the Admins table

### Support Ticket Relationships

1. **Users to SupportTickets (One-to-Many)**
   - Users can create multiple support tickets
   - Implemented via the `user_address` foreign key in the SupportTickets table referencing the Users table

2. **Projects to SupportTickets (One-to-Many)**
   - Support tickets can be associated with specific projects
   - Implemented via the `project_id` foreign key in the SupportTickets table referencing the Projects table

3. **SupportTickets to TicketMessages (One-to-Many)**
   - A support ticket can have multiple messages
   - Implemented via the `ticket_id` foreign key in the TicketMessages table referencing the SupportTickets table

4. **SupportTickets to TicketAttachments (One-to-Many)**
   - A support ticket can have multiple file attachments
   - Implemented via the `ticket_id` foreign key in the TicketAttachments table referencing the SupportTickets table

5. **TicketMessages to TicketAttachments (One-to-Many)**
   - A ticket message can have multiple file attachments
   - Implemented via the `message_id` foreign key in the TicketAttachments table referencing the TicketMessages table

## Supabase-Specific Features

### Authentication Integration

Supabase provides built-in authentication that can be integrated with the CrowdChain platform. The following steps outline how to set up authentication:

1. **Configure Auth Providers**:
   - Enable email/password authentication
   - Set up OAuth providers if needed (Google, GitHub, etc.)
   - Configure JWT expiration and refresh token settings

2. **Link Auth with Users Table**:
   - The `address` field in the Users table should correspond to the `uid` from Supabase Auth
   - This allows for seamless integration between authentication and database access

```sql
-- Example of a trigger to create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (address, email, username)
  VALUES (new.id, new.email, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Row-Level Security (RLS) Policies

Supabase uses PostgreSQL's Row-Level Security to control access to data. The SQL statements for each table include RLS policies that:

1. Allow users to view their own data
2. Allow users to view public data (approved projects, milestones, etc.)
3. Allow admins to view and modify all data based on their role
4. Prevent unauthorized access to sensitive information

### Database Functions and Triggers

Several database functions and triggers are needed to maintain data integrity and automate processes:

```sql
-- Function to update project backer count when a new backer is added
CREATE OR REPLACE FUNCTION update_project_backer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET backer_count = backer_count + 1
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_backer_insert
  AFTER INSERT ON backers
  FOR EACH ROW
  EXECUTE PROCEDURE update_project_backer_count();

-- Function to update project milestone completion count when a milestone is completed
CREATE OR REPLACE FUNCTION update_project_milestone_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 2 AND (OLD.status IS NULL OR OLD.status != 2) THEN
    UPDATE projects
    SET milestone_completed = milestone_completed + 1
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_milestone_update
  AFTER UPDATE ON milestones
  FOR EACH ROW
  EXECUTE PROCEDURE update_project_milestone_completion();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  admin_id INTEGER;
  action_type TEXT;
  entity_type TEXT;
  entity_id TEXT;
  details JSONB;
BEGIN
  -- Get the admin ID from the current user
  SELECT id INTO admin_id FROM admins WHERE email = auth.email();
  
  -- Determine action type, entity type, and entity ID based on the operation
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
  END IF;
  
  entity_type := TG_TABLE_NAME;
  
  IF TG_OP = 'DELETE' THEN
    entity_id := OLD.id::TEXT;
    details := to_jsonb(OLD);
  ELSE
    entity_id := NEW.id::TEXT;
    details := to_jsonb(NEW);
  END IF;
  
  -- Insert the admin action record
  INSERT INTO admin_actions (admin_id, action_type, entity_type, entity_id, details, ip_address)
  VALUES (admin_id, action_type, entity_type, entity_id, details, current_setting('request.headers', true)::jsonb->>'x-forwarded-for');
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for tables that need admin action logging
CREATE TRIGGER log_projects_admin_actions
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  WHEN (EXISTS (SELECT 1 FROM admins WHERE email = auth.email()))
  EXECUTE PROCEDURE log_admin_action();

CREATE TRIGGER log_milestones_admin_actions
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW
  WHEN (EXISTS (SELECT 1 FROM admins WHERE email = auth.email()))
  EXECUTE PROCEDURE log_admin_action();

-- Similar triggers for other tables that need admin action logging
```

### Storage Integration

Supabase provides storage buckets that can be used for storing files like project images and ticket attachments:

```sql
-- Example of creating storage buckets
-- Run this in the SQL editor or via the Supabase dashboard

-- Create a bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'Project Images', true);

-- Create a bucket for ticket attachments (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket_attachments', 'Ticket Attachments', false);

-- Set up RLS policies for the storage buckets
CREATE POLICY "Anyone can view project images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project_images');

CREATE POLICY "Project owners can upload project images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project_images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own ticket attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ticket_attachments' AND
    EXISTS (
      SELECT 1 FROM ticket_attachments ta
      JOIN support_tickets st ON ta.ticket_id = st.id
      WHERE storage_path = name AND st.user_address = auth.uid()::text
    )
  );

CREATE POLICY "Admins can view all ticket attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ticket_attachments' AND
    EXISTS (SELECT 1 FROM admins WHERE email = auth.email())
  );
```

## Migration Guidance

To migrate from the previous schema to the new one, follow these steps:

1. **Backup Existing Data**:
   ```sql
   -- Create a backup of existing tables
   CREATE TABLE users_backup AS SELECT * FROM users;
   CREATE TABLE projects_backup AS SELECT * FROM projects;
   CREATE TABLE milestones_backup AS SELECT * FROM milestones;
   CREATE TABLE backers_backup AS SELECT * FROM backers;
   ```

2. **Create New Tables**:
   - Execute the SQL statements provided in this document to create all new tables
   - Ensure that all constraints and indexes are properly created

3. **Migrate Core Data**:
   ```sql
   -- Migrate users data
   INSERT INTO users (id, address, email, username, profile_image, created_at, updated_at)
   SELECT id, address, email, username, profile_image, created_at, updated_at
   FROM users_backup;

   -- Migrate projects data (excluding removed blockchain_id)
   INSERT INTO projects (
     id, owner_id, title, description, image_url, hash_value, 
     target_amount, expires_at, backer_count, status, 
     has_milestones, milestone_count, milestone_completed, 
     created_at, updated_at
   )
   SELECT 
     id, owner_id, title, description, image_url, hash_value, 
     target_amount, expires_at, backer_count, status, 
     true, milestone_count, milestone_completed, 
     created_at, updated_at
   FROM projects_backup;

   -- Migrate milestones data
   INSERT INTO milestones (
     id, project_id, title, description, amount, 
     yes_votes, created_at, completed_at, status
   )
   SELECT 
     id, project_id, title, description, amount, 
     yes_votes, created_at, completed_at, status
   FROM milestones_backup;

   -- Migrate backers data
   INSERT INTO backers (
     id, owner_id, project_id, transaction_hash, contribution
   )
   SELECT 
     id, owner_id, project_id, transaction_hash, contribution
   FROM backers_backup;
   ```

4. **Set Up Admin Data**:
   ```sql
   -- Create initial admin user
   INSERT INTO admins (
     email, password_hash, first_name, last_name, 
     role, permissions, created_at, updated_at, active
   )
   VALUES (
     'admin@crowdchain.com', 
     -- Use a secure password hashing method like bcrypt
     '$2a$10$rEHxUI1QMmcF1fVnvFVHS.wQ0MKT3yTh7qZzSHQ5nHnPXwfcm81Ky', 
     'System', 'Admin', 
     'super_admin', 
     '{"all": true}', 
     NOW(), NOW(), true
   );

   -- Set up initial platform settings
   INSERT INTO platform_settings (
     setting_key, setting_value, description, updated_by, created_at, updated_at
   )
   VALUES
   ('platform_fee', '{"percentage": 2.5}', 'Platform fee percentage charged on successful projects', 1, NOW(), NOW()),
   ('minimum_project_amount', '{"amount": 100}', 'Minimum funding target for new projects', 1, NOW(), NOW()),
   ('maximum_project_duration', '{"days": 90}', 'Maximum duration in days for a project funding period', 1, NOW(), NOW()),
   ('featured_projects_limit', '{"count": 5}', 'Maximum number of featured projects to display', 1, NOW(), NOW());
   ```

5. **Verify Data Integrity**:
   - Check that all data has been migrated correctly
   - Verify that relationships between tables are maintained
   - Test queries to ensure that the new schema works as expected

6. **Update Application Code**:
   - Update API endpoints to work with the new schema
   - Modify frontend code to handle new fields and relationships
   - Implement admin dashboard functionality to utilize new admin tables

7. **Clean Up**:
   - Once the migration is verified, remove backup tables
   ```sql
   DROP TABLE users_backup;
   DROP TABLE projects_backup;
   DROP TABLE milestones_backup;
   DROP TABLE backers_backup;
   ```

## Conclusion

This Supabase schema documentation provides a comprehensive guide for implementing the CrowdChain database in Supabase. The schema includes all necessary tables, relationships, and security policies to support the platform's functionality.

Key features of the implementation include:
- Core tables for projects, milestones, and backers
- Administrative tables for platform management
- Support ticket system for user assistance
- Analytics tracking for platform insights
- Row-level security for data protection
- Database functions and triggers for automation
- Storage integration for file management

By following this documentation, you can successfully implement and maintain the CrowdChain database in Supabase, ensuring a robust and secure foundation for the platform.
