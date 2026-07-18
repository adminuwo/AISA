# AISA Frontend (Vite + React)

This is the frontend single-page application (SPA) for AISA (Artificial Intelligence Strategic Assistant), built with React, Vite, Tailwind CSS v4, and integrated with React Native Web shims.

---

## 🛠 Tech Stack
*   **Core:** React 18 & Vite 6 (Fast Refresh & Optimized Code-Splitting)
*   **Styling:** Tailwind CSS v4, Styled-Components, Framer Motion, and GSAP/Lenis for premium animations and layout effects.
*   **State Management:** Recoil (`recoil`), Zustand (`zustand`), and React Context.
*   **Integrations:** Monaco Editor, Recharts, and Google / Razorpay checkout modules.

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Node.js v20+](https://nodejs.org/) installed on your machine.

### 2. Installation
Install the project dependencies using `npm`:
```bash
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` may be required to resolve strict version peer dependency constraints with React Native Web components).*

### 3. Environment Configuration
Create a `.env` file in the root of the project. AISA accepts variables prefixed with either `VITE_` or `AISA_`:

```env
# API Endpoint for the AISA Backend
VITE_AISA_BACKEND_API=http://localhost:8080/api

# Google OAuth integration Client ID
AISA_GOOGLE_CLIENT_ID=your-google-client-id

# Razorpay key for checkout integrations
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id

# Link to parent platform
VITE_AI_MALL=https://aimall24.com
```

### 4. Running Locally
Start the Vite development server:
```bash
npm run dev
```
The application will launch on your default local address (usually `http://localhost:5173`).

---

## 🐳 Dockerization & Production Deployment

The project is structured to deploy smoothly using Docker and Google Cloud Run. It uses a **multi-stage build** that builds the assets and serves them via **Nginx** (listening on port `8080`).

### Runtime Environment Variables Injection
Instead of baking variables into the static JS files at build time, the deployment uses [entrypoint.sh](file:///c:/Users/Sansk/OneDrive/Desktop/AISA/AISA_New/entrypoint.sh) to dynamically inject host-level configuration (prefixed with `VITE_` or `AISA_`) into `/env-config.js` at runtime.

### Build and Run Docker Locally
1. Build the Docker image:
   ```bash
   docker build --build-arg VITE_GOOGLE_CLIENT_ID=your-id -t aisa-frontend .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 -e VITE_AISA_BACKEND_API="http://api.aisa24.com/api" aisa-frontend
   ```

---

## 📂 Key Directory Structure

```
AISA_New/
├── .github/workflows/   # CI/CD pipelines
├── .husky/              # Git hooks (pre-commit checks)
├── public/              # Static public assets
├── src/
│   ├── Components/      # Reusable components (Chat, SideBar, Onboarding)
│   ├── context/         # Theme & Language Providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page-level components (Chat.jsx, Auth.jsx)
│   ├── services/        # API integrations, OAuth, and storage layers
│   ├── shims/           # Web compatibility wrappers for React Native/Expo
│   ├── Tools/           # Specialized modules (AI Legal, Cashflow, Social)
│   └── userStore/       # State stores (Zustand & Recoil config)
├── vite.config.js       # Bundler configuration (code splitting, path aliases)
└── Dockerfile           # Multi-stage production container setup
```

---

## 💅 Code Quality & Standards
*   **Formatting:** Configured with Prettier (`.prettierrc.json`). Pre-commit hooks via Husky check file staging rules.
*   **Linting:** ESLint rules defined in `eslint.config.js`.
*   **Build Optimization:** Rollup code-splitting rules are defined in `vite.config.js` to separate charts, animations, Monaco Editor, and parser utilities into distinct chunks.
