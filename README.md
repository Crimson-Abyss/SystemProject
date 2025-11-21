# InsteaG - Loyalty & Rewards Platform

This is a full-stack web application for a customer loyalty and rewards program. Users can sign up, earn points, view their transaction history, and redeem points for rewards. The application features a modern, responsive interface with dark mode support.

## ✨ Features

*   **User Authentication**: Secure sign-up, login, and sign-out functionality.
*   **Personalized Dashboard**: A welcoming home screen that displays the user's name, points balance, featured offers, and recent activity.
*   **Points & Rewards**: Users can view available rewards and redeem them using their points.
*   **Transaction History**: A detailed log of points earned and spent.
*   **QR Code Scanner**: An in-app camera feature to scan QR codes and earn points.
*   **Profile Management**: Users can view their profile details and upload a custom avatar.
*   **Responsive Design**: A mobile-first design that works beautifully on all screen sizes.
*   **Dark Mode**: A sleek dark theme that can be toggled based on system preference.

## 🛠️ Tech Stack

*   **Frontend**:
    *   [React](https://reactjs.org/)
    *   [Vite](https://vitejs.dev/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [React Router](https://reactrouter.com/) for client-side routing.
    *   [React Icons](https://react-icons.github.io/react-icons/) for UI icons.

*   **Backend**:
    *   [Node.js](https://nodejs.org/)
    *   [Express](https://expressjs.com/) (implied for API routing)
    *   A database (e.g., MongoDB, PostgreSQL) would be used for data persistence.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v14 or newer)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd system-project
    ```

2.  **Install frontend dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Install backend dependencies:**
    ```sh
    cd server
    npm install
    # or
    yarn install
    cd ..
    ```

### Running the Application

1.  **Start the backend server:**
    From the `server` directory, run:
    ```sh
    npm run dev
    # This will start the backend server, typically on http://localhost:3001
    ```

2.  **Start the frontend development server:**
    From the root project directory (`system-project`), run:
    ```sh
    npm run dev
    # This will start the Vite development server, typically on http://localhost:5173
    ```

3.  Open your browser and navigate to `http://localhost:5173` to see the application in action.

## 📄 License

This project is unlicensed. You are free to use, modify, and distribute it as you see fit.
