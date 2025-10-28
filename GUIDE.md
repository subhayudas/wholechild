# Production Readiness Plan

This document outlines the current state of the application and the necessary steps to make it production-ready, focusing on security, scalability, and stability.

## 1. Current State

The application is currently a **frontend-only React application** built with Vite.

- **Architecture:** It is a Single-Page Application (SPA) where all logic runs in the user's browser.
- **Authentication:** Authentication is mocked using `setTimeout` and Zustand's `persist` middleware. There is no real user validation or secure session management.
- **API Communication:** All third-party API calls (e.g., to OpenAI) are made directly from the client-side.
- **Security Risk:** Critical credentials, such as the OpenAI API key, are exposed in the frontend code, posing a significant security risk.
- **Scalability:** The current architecture does not scale. It is vulnerable to client-side performance issues, exposes the application to abuse, and lacks the infrastructure to support multiple simultaneous users effectively.

## 2. Target State (Production Ready)

The goal is to transition to a **Client-Server Architecture** with a clear separation of concerns.

- **Architecture:** A robust backend service will handle all business logic, authentication, and communication with external APIs. The React frontend will be responsible for the UI and user interaction, communicating with the backend via a secure API.
- **Authentication:** A secure, token-based authentication system (e.g., JWT) will be implemented on the backend.
- **API Communication:** The backend will act as a proxy for all OpenAI calls, protecting the API key and allowing for server-side caching and rate-limiting.
- **Database:** A database will be integrated to persist all user, child, and activity data.

## 3. The Go-Forward Plan & Technology Stack

To meet the primary goal of getting to production **as quickly and easily as possible**, we will adopt a **separate backend** strategy. This avoids a time-consuming frontend migration and allows for focused, parallel work.

- **Frontend:** **(No changes)**. We will keep the existing **Vite + React** application. All frontend work will focus on connecting to the new backend API and implementing performance improvements.
- **Backend:** We will create a new, separate **Node.js + Express.js** server. This provides the fastest path to building the required API endpoints.
- **Database:** We will use **MongoDB** as our primary database. Its flexible, document-based nature is a perfect fit for the complex JSON structures returned by the OpenAI API.

This approach minimizes rework and directly addresses the critical security and scalability issues.

## 4. Production Readiness Checklist

This checklist outlines the **backend-focused plan** to get the application production-ready. The only frontend changes required are those necessary to connect to the new backend API endpoints. No other frontend enhancements or refactoring will be undertaken.

### Backend Implementation & Frontend Integration

-   [X] **1. Set Up the Express.js Backend Server:**
    -   [X] Initialize a new Node.js project (`npm init`) in a new `/backend` directory.
    -   [X] Add Express.js and essential middleware (`cors`, `dotenv`).
    -   [X] Configure CORS to allow requests from the Vite frontend's origin (e.g., `http://localhost:5173`).

-   [X] **2. Create Backend Proxy for OpenAI:**
    -   [X] Create a new API endpoint on the Express server (e.g., `/api/generate-activity`).
    -   [X] Securely store the OpenAI API key on the server using a `.env` file.
    -   [X] **Frontend Change:** Modify `src/services/openaiService.ts` to call `http://localhost:PORT/api/generate-activity` instead of the OpenAI API directly.

-   [ ] **3. Implement Backend Authentication & User Management:**
    -   [X] Set up a MongoDB database and connect it to the Express server (e.g., using Mongoose).
    -   [ ] Create Mongoose schemas for `User`, `Child`, and `Activity`.
    -   [ ] Create backend API endpoints for user registration and login (`/api/auth/register`, `/api/auth/login`).
    -   [ ] Implement password hashing using `bcrypt`.
    -   [ ] Generate a JWT token upon successful login and send it to the client.
    -   [ ] Create protected middleware in Express to verify the JWT on incoming requests.
    -   [ ] **Frontend Change:** Modify `src/store/authStore.ts` to call the new backend authentication endpoints.

-   [ ] **4. Implement Core API Endpoints:**
    -   [ ] Create CRUD (Create, Read, Update, Delete) endpoints for `Child` profiles.
    -   [ ] Create CRUD endpoints for `Activity` data.
    -   [ ] **Frontend Change:** Update the corresponding frontend stores (`childStore.ts`, `activityStore.ts`) to use these new API endpoints. 