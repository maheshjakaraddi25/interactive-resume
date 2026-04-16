# Project: Student Voting System

## Overview
**Stack:** PERN (PostgreSQL · Express.js · React.js · Node.js)
**Type:** Full Stack Web Application
**Deployment:** Azure (cloud-native)

---

## What It Is
A full-stack web platform designed for student elections and voting. It handles the entire lifecycle: registration, role-based access, ballot casting, and result viewing — with proper security so students can only vote once and results are tamper-resistant.

## Architecture

### Frontend (React.js)
- Built with React.js using reusable component architecture
- Role-based UI — what a student sees is different from what an admin sees
- Connected to the backend via a REST API-driven architecture
- Clean separation between presentation and data layers

### Backend (Node.js + Express.js)
- RESTful API design with clear endpoint structure
- Handles authentication, authorization, vote processing, and result aggregation
- Business logic isolated from route handlers — proper layering

### Database (PostgreSQL)
- Relational schema for users, roles, candidates, votes, and elections
- Constraints enforced at the database level (unique votes per user per election)
- Designed to be consistent — a vote either goes through completely or not at all

### Authentication & Authorization
- JWT (JSON Web Tokens) for stateless authentication
- Role-based access control: Student, Admin roles with different permissions
- Token validation middleware on every protected route

### Deployment
- Deployed on Azure using cloud-native infrastructure
- Azure App Service for the Node.js backend
- Azure Database for PostgreSQL
- Proper environment separation between dev and prod

## Key Decisions & Trade-offs
- Chose PostgreSQL over MongoDB because elections require ACID guarantees — you cannot have partial vote transactions
- Used JWT over sessions for stateless scaling (easier to add more backend instances)
- RBAC was built into the API layer, not just the frontend (security at the source, not just in the UI)

## What I'd Do Differently
Looking back, I'd add more comprehensive integration tests for the voting flow, and I'd implement rate limiting more aggressively on the vote submission endpoint. I'd also consider WebSockets for real-time result updates rather than polling.
