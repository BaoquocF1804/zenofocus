<div align="center">
<img width="1200" height="475" alt="ZenFocus Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ZenFocus

ZenFocus is a modern, aesthetic Pomodoro timer application designed to help you stay focused and productive. It features a customizable timer, task management, session history, ambient sounds, and beautiful themes.

## Features

- **Pomodoro Timer**: Customizable Focus, Short Break, and Long Break durations.
- **Task Management**: Add, edit, complete, and delete tasks.
- **Session History**: Track your focus sessions and daily progress.
- **Themes**: Switch between Nature, Lofi, Tech, and Vintage themes.
- **Audio Focus**: Built-in Brown Noise and curated YouTube mood playlists.
- **Smart Tips**: Get helpful productivity tips during breaks.
- **Data Persistence**: All data is stored locally in a SQLite database.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide React.
- **Backend**: Node.js, Express.
- **Database**: SQLite.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1.  **Clone the repository** (if applicable) or download the source code.

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**:
    ```bash
    cd backend
    npm install
    cd ..
    ```

### Running the Application

You need to run both the backend server and the frontend development server.

1.  **Start the Backend Server**:
    Open a terminal and run:
    ```bash
    cd backend
    npm start
    ```
    The server will start on `http://localhost:3001`. The database `zenfocus.db` will be created automatically.

2.  **Start the Frontend**:
    Open a new terminal window and run:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

## API Documentation

The backend provides the following REST API endpoints:

-   **Settings**: `GET /api/settings`, `POST /api/settings`
-   **Tasks**: `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
-   **Sessions**: `GET /api/sessions`, `POST /api/sessions`
-   **Theme**: `GET /api/theme`, `POST /api/theme`

## License

MIT
