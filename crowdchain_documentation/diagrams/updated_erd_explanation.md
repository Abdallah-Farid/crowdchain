# Updated Entity Relationship Diagram (ERD) for CrowdChain

This document explains the changes made to the CrowdChain database schema as reflected in the updated ERD diagram.

## Changes Made

### Removed Elements

1. **Project Updates Table**: This table was removed as it was not essential to the core functionality of the platform.

2. **Milestone Disbursement Table**: This table was removed, with the assumption that disbursement information can be tracked directly within the Milestones table.

3. **blockchain_id Attribute from Projects Table**: This attribute was removed to reduce direct coupling with the blockchain implementation, making the data model more flexible.

### Added Elements

1. **Admin-Related Tables**:
   - **Admins**: Stores information about admin users with different roles and permissions
   - **AdminActions**: Logs all actions performed by admins for auditing purposes
   - **PlatformSettings**: Stores configurable platform settings
   - **SupportTickets**: Manages user support requests
   - **TicketMessages**: Stores messages exchanged in support tickets
   - **TicketAttachments**: Manages file attachments for support tickets
   - **AnalyticsAggregates**: Stores pre-calculated analytics data for reporting

2. **New Attributes in Existing Tables**:
   - **Projects**: Added admin_approved, admin_approved_by, admin_approved_at, featured, featured_by, featured_at, and admin_notes
   - **Milestones**: Added admin_reviewed, admin_reviewed_by, and admin_reviewed_at
   - **Backers**: Added flagged, flagged_reason, flagged_by, and flagged_at

## Schema Details

### Core Tables

1. **Projects**
   - Primary entity for crowdfunding projects
   - Contains project details, funding information, and status
   - New admin-related fields for project approval and featuring
   - Relationships:
     - One-to-many with Milestones
     - One-to-many with Backers
     - Many-to-one with Users (creator)
     - Many-to-one with Admins (for approval and featuring)

2. **Milestones**
   - Represents project milestones with funding amounts and voting status
   - Contains admin review information
   - Relationships:
     - Many-to-one with Projects
     - Many-to-one with Admins (for review)

3. **Backers**
   - Represents users who have contributed to projects
   - Contains contribution amount and status
   - New fields for flagging suspicious contributions
   - Relationships:
     - Many-to-one with Projects
     - Many-to-one with Admins (for flagging)

4. **Users**
   - Contains user account information
   - Relationships:
     - One-to-many with Projects (as creators)

### Admin-Related Tables

1. **Admins**
   - Stores admin user information
   - Contains authentication details, role, and permissions
   - Relationships:
     - One-to-many with Projects (for approval and featuring)
     - One-to-many with Milestones (for review)
     - One-to-many with Backers (for flagging)
     - One-to-many with AdminActions
     - One-to-many with PlatformSettings
     - One-to-many with SupportTickets (as assignee)

2. **AdminActions**
   - Logs all administrative actions for auditing
   - Contains action type, affected entity, and details
   - Relationships:
     - Many-to-one with Admins

3. **PlatformSettings**
   - Stores configurable platform settings
   - Contains setting key, value, and description
   - Relationships:
     - Many-to-one with Admins (for updates)

4. **SupportTickets**
   - Manages user support requests
   - Contains ticket details, status, and priority
   - Relationships:
     - Many-to-one with Projects (optional)
     - Many-to-one with Admins (assignee)
     - One-to-many with TicketMessages
     - One-to-many with TicketAttachments

5. **TicketMessages**
   - Stores messages exchanged in support tickets
   - Contains message content and sender information
   - Relationships:
     - Many-to-one with SupportTickets
     - One-to-many with TicketAttachments

6. **TicketAttachments**
   - Manages file attachments for support tickets
   - Contains file metadata and storage path
   - Relationships:
     - Many-to-one with SupportTickets
     - Many-to-one with TicketMessages (optional)

7. **AnalyticsAggregates**
   - Stores pre-calculated analytics data
   - Contains metric name, time period, and value
   - No direct relationships with other tables

## Key Relationships

1. **Projects to Milestones**: One-to-many relationship where a project can have multiple milestones.

2. **Projects to Backers**: One-to-many relationship where a project can have multiple backers.

3. **Users to Projects**: One-to-many relationship where a user can create multiple projects.

4. **Admins to Projects/Milestones/Backers**: One-to-many relationships for administrative actions like approval, featuring, reviewing, and flagging.

5. **SupportTickets to Projects**: Many-to-one relationship where a support ticket can be associated with a specific project.

6. **SupportTickets to TicketMessages/TicketAttachments**: One-to-many relationships for managing support ticket content.

## Conclusion

The updated ERD reflects a more streamlined core data model with the removal of non-essential tables and attributes. It also incorporates comprehensive admin functionality through new tables and relationships, enabling platform administrators to effectively monitor, manage, and support the crowdfunding ecosystem.

The changes maintain the essential functionality of the platform while adding the administrative layer necessary for sustainable growth. The schema is designed to be flexible and scalable, accommodating future enhancements to the CrowdChain platform.
