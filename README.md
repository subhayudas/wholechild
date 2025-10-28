# WholeChild: Personalized Learning Platform

This is a web application designed to help parents, educators, and therapists create personalized learning and therapy activities for children. The platform uses AI to generate tailored activities based on a child's unique profile, interests, and developmental goals.

## Tech Stack

- **Frontend:** React (with Vite)
- **State Management:** Zustand
- **Styling:** Tailwind CSS

## Getting Started

Follow these instructions to get the project up and running on your local machine. This project has a separate frontend and backend, which must be run in separate terminals.

### Prerequisites

- Node.js (v18 or higher recommended)
- An NPM compatible package manager (e.g., npm, yarn, or pnpm)

### 1. Backend Setup

First, set up and start the backend server.

1.  **Navigate to the backend directory and install dependencies:**
    ```sh
    cd backend
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file in the `backend/` directory and add the following variables. You can copy the `.env.example` file.
    ```env
    DATABASE_URL="your_mongodb_connection_string"
    JWT_SECRET="your_jwt_secret_key"
    OPENAI_API_KEY="your_openai_api_key_here"
    PORT=3001
    ```

3.  **Run the development server:**
    ```sh
    # From the backend/ directory
    npm run dev
    ```
    The backend API should now be running on `http://localhost:3001`.

### 2. Frontend Setup

With the backend running, you can now start the frontend. Open a **new terminal** for this.

1.  **Install dependencies from the project root:**
    ```sh
    # Ensure you are in the project's root directory
    npm install
    ```

2.  **Run the development server:**
    ```sh
    # From the project's root directory
    npm run dev
    ```

The frontend application should now be running on `http://localhost:5173` (or another port if 5173 is in use) and will be able to communicate with your backend.