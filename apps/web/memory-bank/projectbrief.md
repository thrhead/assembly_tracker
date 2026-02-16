# Assembly Tracker Project Brief

## Project Overview
Assembly Tracker is a comprehensive platform for tracking field assembly and service teams. The system enables management of assembly processes, cost control, and team coordination for factory external operations through both a web dashboard and a native mobile application.

## Core Requirements
- User authentication with role-based access (Admin, Manager, Team Lead, Worker, Customer)
- Job tracking system with step-by-step progress monitoring
- Team management and assignment capabilities
- Cost tracking and approval workflows
- Real-time notifications and status updates
- **Native Mobile Application (iOS/Android) for field workers**
- Mobile-responsive web interface with Turkish language support

## Key Features
- Job creation with detailed steps and sub-steps
- Time tracking for sub-tasks with start/end times
- Automatic parent task completion when all sub-tasks are done
- Team performance metrics and visualizations
- Photo upload for work documentation
- Reporting system for job status and costs
- **Mobile Features**:
  - Offline-capable job list
  - Native map integration
  - Camera integration for photo uploads
  - Push notifications

## Technical Stack
- **Web**: Next.js 16 with App Router
- **Mobile**: React Native with Expo
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v4 (Web & API)
- **Styling**: TailwindCSS (Web), Native Styles (Mobile)
- **Real-time**: Socket.IO

## Current Status
The application is in a Production-ready state for the Web platform (v2.0) and Stable state for the Mobile platform (v2.5). All core features including User/Customer management, Job tracking, and Cost management are implemented across both platforms.

## Next Steps
1. Conduct extensive field testing for the mobile app
2. Implement offline mode and push notifications for mobile
3. Optimize performance and polish UI/UX
4. Prepare for production deployment
