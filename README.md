# AISA Frontend 🚀

> **AI-Powered SaaS Platform — React + Vite Client**

AISA (AI Sales Assistant) is a full-stack SaaS platform delivering intelligent, multi-modal AI agents through a sleek, premium React interface. This is the frontend application.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router DOM |
| State | React Context + Hooks |
| Styling | Vanilla CSS (Custom Design System) |
| Animations | Framer Motion, GSAP |
| Real-time | Socket.io Client |
| HTTP | Axios |
| UI Extras | Lucide Icons, React Hot Toast |

---

## ✨ Key Features

- 🤖 **Multi-Mode AI Chat** — Switch between specialized AI agents (Writer, Coder, Analyst, Legal, Finance & more)
- 🎨 **Magic Tools** — In-chat tool cards for code generation, image creation, document export
- 💼 **AI Social Media Dashboard** — Generate, schedule, and preview AI-written posts
- 📊 **Finance Dashboard** — Real-time market data visualization
- 🔐 **Auth System** — JWT-based login, Google OAuth, Apple Sign-In
- 💳 **Subscription Management** — Razorpay-powered plans with tier-gated features
- 🌗 **Dark / Light Mode** — Full theme support with smooth transitions
- 📱 **Responsive Design** — Mobile-first, premium aesthetics
- ⚡ **Lazy Loading** — Code-split agent tools for optimal performance

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend server running (see [AISA-Backend](https://github.com/adminuwo/AISA-Backend))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/adminuwo/AISA.git
cd AISA

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Set VITE_API_URL to your backend URL

# 4. Start development server
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## 📁 Project Structure

```
Aisa/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── Tools/           # AI agent tool components (lazy loaded)
│   ├── landingpage/     # Landing page sections
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Shared utilities
│   └── assets/          # Static assets
├── public/              # Public static files
├── index.html           # HTML entry point
└── vite.config.js       # Vite configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 🐳 Docker

```bash
docker build -t aisa-frontend .
docker run -p 3000:80 aisa-frontend
```

---

## 🔗 Related

- **Backend**: [AISA-Backend](https://github.com/adminuwo/AISA-Backend)

---

## 📄 License

Private — All rights reserved © AISA
