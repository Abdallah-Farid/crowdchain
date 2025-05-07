# CrowdChain Use Case Diagram Explanation

This document explains the use case diagram for the CrowdChain platform, which illustrates the interactions between different actors and the system functionalities.

## Diagram Location

The use case diagram is available at: `./use_case_diagram.png`

## Actors

The diagram includes four main actors:

### 1. Regular User

A Regular User represents any individual who interacts with the CrowdChain platform. This is the base actor from which Project Creator and Backer inherit. Regular Users can:

- Register an account on the platform
- Login to their account
- Recover their password if forgotten
- View project listings
- View detailed information about specific projects
- Search and filter projects based on various criteria

### 2. Project Creator

A Project Creator is a specialized type of Regular User who creates and manages crowdfunding projects on the platform. Project Creators can:

- Create new projects with details, milestones, and funding goals
- Post updates about their projects
- Submit milestone completions with evidence
- Respond to questions from backers

### 3. Backer

A Backer is a specialized type of Regular User who financially supports projects on the platform. Backers can:

- Back projects by contributing funds
- Vote on milestone completions
- Request refunds under certain conditions
- Comment on projects
- Receive updates about projects they've backed

### 4. Admin

An Admin is responsible for platform management and oversight. Admins can:

- Review new projects for approval
- Monitor platform activity
- Manage user accounts
- Review transactions
- Manage fund distributions
- Process refund requests
- Handle support tickets
- Generate reports
- Configure platform settings

## Use Case Categories

The use cases are organized into five main functional areas:

### 1. Account Management

This category includes use cases related to user authentication and account operations:
- Register Account
- Login
- Recover Password

### 2. Project Browsing

This category includes use cases related to discovering and viewing projects:
- View Project Listings
- View Project Details
- Search/Filter Projects

### 3. Project Management

This category includes use cases related to creating and managing projects:
- Create Project
- Post Project Updates
- Submit Milestone Completion
- Respond to Backer Questions

### 4. Backing & Interaction

This category includes use cases related to supporting projects and interacting with them:
- Back a Project
- Vote on Milestone Completion
- Request Refund
- Comment on Projects
- Receive Project Updates

### 5. Administration

This category includes use cases related to platform administration:
- Review New Projects
- Monitor Platform Activity
- Manage User Accounts
- Review Transactions
- Manage Fund Distributions
- Process Refund Requests
- Handle Support Tickets
- Generate Reports
- Configure Platform Settings

## Relationships

The diagram shows two types of relationships:

1. **Actor-to-Use Case Associations**: These are represented by solid lines connecting actors to the use cases they can perform.

2. **Inheritance Relationships**: Both Project Creator and Backer inherit from Regular User, indicating that they can perform all the actions of a Regular User in addition to their specialized actions.

## Design Considerations

The use case diagram was designed with the following considerations:

1. **Simplicity**: The diagram focuses on the main interactions without overwhelming detail.

2. **Logical Grouping**: Use cases are grouped into functional areas to improve readability.

3. **Clear Actor Roles**: Each actor has a distinct set of responsibilities.

4. **Comprehensive Coverage**: The diagram includes both existing functionality and the new admin functionality.

5. **Standard UML Notation**: The diagram follows standard UML notation for use case diagrams.

This use case diagram serves as a high-level overview of the CrowdChain platform's functionality from the perspective of its users. It provides a clear visualization of what different types of users can do on the platform and how the system supports these interactions.
