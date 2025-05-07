# Simplified Use Case Scenarios for CrowdChain Platform

This document outlines the simplified use case scenarios for the CrowdChain platform, organized by user roles. Each scenario focuses on the happy path with brief mentions of exception handling.

## Regular User Scenarios

### User Registration and Authentication

1. **New User Registration**
   - User visits the CrowdChain platform
   - Clicks on "Sign Up" button
   - Fills in required information (name, email, password)
   - Verifies email through confirmation link
   - Account is created successfully
   - *Exception: Email already registered or validation fails*

2. **User Login**
   - User visits the CrowdChain platform
   - Enters email and password
   - System authenticates credentials
   - User is redirected to dashboard
   - *Exception: Invalid credentials prompt re-entry*

3. **Password Recovery**
   - User clicks "Forgot Password"
   - Enters registered email
   - Receives password reset link
   - Creates new password
   - *Exception: Email not found in system*

### Browsing Projects

1. **Viewing Project Listings**
   - User navigates to project listings
   - Views projects with basic information (title, funding goal, timeline)
   - Filters projects by category, funding status, or popularity
   - *Exception: No projects match filter criteria*

2. **Viewing Project Details**
   - User selects a specific project
   - Views comprehensive project information (description, milestones, current funding)
   - Sees project creator information and backer statistics
   - *Exception: Project has been removed or suspended*

## Project Creator Scenarios

### Project Creation and Management

1. **Creating a New Project**
   - Creator logs into account
   - Selects "Create New Project"
   - Enters project details (title, description, funding goal)
   - Defines project milestones with deliverables and funding allocations
   - Uploads supporting media (images, videos)
   - Submits project for review
   - *Exception: Missing required information prevents submission*

2. **Managing Project Updates**
   - Creator navigates to project dashboard
   - Selects "Post Update"
   - Creates update with text and optional media
   - Publishes update to all backers
   - *Exception: Update fails to publish due to system error*

3. **Milestone Completion Submission**
   - Creator marks milestone as complete
   - Provides evidence of completion (documentation, media)
   - Submits for backer voting
   - *Exception: Cannot submit without required evidence*

4. **Responding to Backer Questions**
   - Creator receives notification of backer question
   - Views question in project dashboard
   - Composes and posts response
   - *Exception: Too many questions overwhelm notification system*

## Backer Scenarios

### Backing Projects and Milestone Voting

1. **Backing a Project**
   - Backer browses projects and selects one to support
   - Clicks "Back This Project" button
   - Selects funding amount
   - Reviews terms and conditions
   - Completes payment process
   - Receives confirmation of backing
   - *Exception: Payment processing fails*

2. **Voting on Milestone Completion**
   - Backer receives notification of milestone submission
   - Reviews evidence provided by creator
   - Casts vote (approve/reject)
   - Submits vote before deadline
   - *Exception: Voting period expires before vote submission*

3. **Requesting Refund**
   - Backer navigates to backed project
   - Selects "Request Refund" option
   - Provides reason for refund request
   - Submits request
   - Receives confirmation of request processing
   - *Exception: Project terms don't allow refunds at current stage*

### Interacting with Projects

1. **Commenting on Projects**
   - Backer navigates to project discussion section
   - Composes comment or question
   - Posts comment to project page
   - *Exception: Comment flagged for inappropriate content*

2. **Receiving Project Updates**
   - Backer receives notification of project update
   - Views update in project dashboard or email
   - Optionally responds to update
   - *Exception: Email delivery fails*

## Admin Scenarios

### Admin Dashboard and Monitoring

1. **Reviewing New Projects**
   - Admin logs into admin dashboard
   - Views list of projects pending review
   - Reviews project details and content
   - Approves or rejects project with comments
   - *Exception: Project requires additional information before decision*

2. **Monitoring Platform Activity**
   - Admin accesses activity monitoring dashboard
   - Views real-time platform statistics (users, projects, transactions)
   - Identifies unusual patterns or potential issues
   - *Exception: Dashboard data has synchronization delay*

3. **Managing User Accounts**
   - Admin searches for specific user account
   - Views user profile and activity history
   - Takes appropriate action (verify, suspend, restore)
   - *Exception: User has pending transactions that prevent account changes*

### Transaction Management

1. **Reviewing Transaction History**
   - Admin navigates to transaction logs
   - Filters transactions by type, status, or date range
   - Views detailed information for specific transactions
   - *Exception: Transaction data incomplete due to processing error*

2. **Managing Fund Distributions**
   - Admin reviews milestone voting results
   - Verifies milestone completion criteria
   - Approves fund distribution to project creator
   - *Exception: Voting results are contested or inconclusive*

3. **Processing Refund Requests**
   - Admin reviews pending refund requests
   - Verifies eligibility according to platform policies
   - Approves or denies refund with explanation
   - *Exception: Funds already distributed to creator*

### Support Ticket System

1. **Viewing Support Tickets**
   - Admin accesses support ticket dashboard
   - Views list of open tickets sorted by priority
   - Selects ticket to review details
   - *Exception: Ticket volume exceeds capacity*

2. **Responding to Support Tickets**
   - Admin reviews ticket information and history
   - Composes appropriate response
   - Resolves issue or escalates to specialized team
   - Updates ticket status
   - *Exception: Issue requires additional information from user*

3. **Generating Support Reports**
   - Admin selects reporting period
   - Chooses report parameters (ticket types, resolution times)
   - Generates and exports report
   - *Exception: Report generation times out for large data sets*

## Analytics Scenarios

1. **Viewing Platform Analytics**
   - User (Admin or Project Creator) accesses analytics dashboard
   - Views key performance metrics relevant to their role
   - Filters data by time period or category
   - Exports reports as needed
   - *Exception: Analytics processing delay for real-time data*

2. **Project Performance Analysis**
   - Project Creator views project-specific analytics
   - Analyzes backer demographics and funding patterns
   - Identifies successful strategies for future projects
   - *Exception: Insufficient data for new projects*

3. **Funding Trend Analysis**
   - Admin reviews platform-wide funding trends
   - Identifies popular categories and seasonal patterns
   - Uses insights for platform improvement
   - *Exception: External market factors create anomalies in data*
