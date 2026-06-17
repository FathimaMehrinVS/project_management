# Project Hub 🚀

A modern, responsive, and secure **Project Management Dashboard** built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. It features a state-of-the-art **Glassmorphism Dark UI** and implements strict **Role-Based Access Control (RBAC)** to secure resource permissions. 

To simplify local development and testing, the project runs on an **in-memory mock API database** integrated directly as a middleware in the Vite development server.

---

## 🎨 Design & Theme

* **Dark-First Aesthetics**: Sleek `#0f0f13` obsidian-dark canvas that reduces eye strain and emphasizes interface elements.
* **Glassmorphism Panel System**: Blurred backdrop elements (`backdrop-filter: blur(12px)`) with subtle borders to give cards and navigation a premium floating feel.
* **Modern Typography & Indicators**: Styled with custom Inter font weights, accent glowing states, and colored status/role badges.

---

## 🔑 Role-Based Access Control (RBAC) Matrix

The system enforces permissions on the frontend (UI elements, routing) and backend (mock server API endpoints). Below is the access matrix:

| Action | Admin | Manager | User (Owner) | User (Non-Owner) |
| :--- | :---: | :---: | :---: | :---: |
| **View Projects List** | Yes | Yes | Yes | Yes |
| **View Project Details** | Yes | Yes | Yes | Yes |
| **Create Project** | Yes | Yes | Yes | Yes |
| **Edit Project Details** | Yes | Yes | Yes | No (Read-Only) |
| **Delete Project** | Yes | No | No | No |

---

## 🛠️ Features

1. **Authentication (JWT-like Flow)**
   * Secure LoginPage with client-side credential verification.
   * Simulated JSON Web Token session storage to persist authentication states across page reloads.

2. **Metrics Dashboard**
   * Real-time metrics counters displaying total projects, active projects, completed projects, and drafts.
   * Unified Project Workspace repository table with status color-coding.

3. **Detailed Project View & Forms**
   * Role-based input blocking: inputs become read-only dynamically for users without edit permissions.
   * Save status feedback indicators (success/error banners).

4. **Self-Contained Mock Database**
   * Development server features a mock Node.js API middleware (`mock-api-middleware.ts`).
   * Intercepts HTTP requests on `/api/v1/` routes for authenticating users and performing CRUD actions on projects.

---

## 💻 Tech Stack

* **Core Framework**: React 19 (TypeScript)
* **Build Tooling**: Vite 8
* **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` compiler integration)
* **Routing**: React Router DOM v7
* **Mock Backend**: Custom Connect/Express-style middleware inside Vite dev server

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Installation
Clone the repository and install the dependencies:
```bash
# Clone the repository
git clone https://github.com/FathimaMehrinVS/project_management.git

# Navigate into the project folder
cd project_management

# Install dependencies
npm install
```

### 3. Running Locally
Launch the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🔐 Mock Test Accounts

You can log in using any of the following pre-configured mock accounts to test different role permissions:

| Email | Password | Assigned Role | Permissions |
| :--- | :--- | :---: | :--- |
| `admin@example.com` | `password` | **Admin** | Full read, write, update, and delete access. |
| `manager@example.com` | `password` | **Manager** | Full read, write, and edit access. Cannot delete. |
| `user1@example.com` | `password` | **User** | Read all, create new, edit only **their own** projects. |
| `user2@example.com` | `password` | **User** | Read all, create new, edit only **their own** projects. |

---

## 📂 File Directory Structure

```text
project_management/
├── mock-api-middleware.ts      # Custom Vite Node.js dev server backend database mock
├── vite.config.ts              # Vite plugins (Tailwind, React) and mock API registration
├── package.json                # Project dependencies and run scripts
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component + routing configurations
│   ├── index.css               # Global styling, Tailwind v4 imports, design tokens
│   ├── auth/
│   │   └── AuthProvider.tsx    # JWT storage, React context auth provider, and apiFetch wrapper
│   └── pages/                  # Page Components
│       ├── LoginPage.tsx       # Auth Login interface
│       ├── DashboardPage.tsx   # Project statistics and list repository
│       ├── ProjectNewPage.tsx  # Project creation wizard
│       └── ProjectViewPage.tsx # Project editing details and delete controls
```
