# Contributing Guidelines for AISA Frontend

Welcome! Thank you for contributing to the AISA frontend repository. To maintain code quality, consistency, and clean git history, please follow these guidelines.

---

## 🛠 Setup & Environment

1.  **Clone and Install:**
    ```bash
    git clone <repository-url>
    cd AISA_New
    npm install --legacy-peer-deps
    ```
2.  **Environment Setup:**
    *   Copy the template: `cp .env.example .env`
    *   Open `.env` and fill in the required keys for your local API connection.

---

## 💅 Code Quality & Standards

We enforce styling and formatting rules automatically using ESLint, Prettier, and Husky.

### Pre-commit Hooks (Husky)
Before you commit, Husky runs automated checks to format and lint your changes. If there are syntax or linting errors, the commit will be blocked until fixed.

*   **Format code manually:**
    ```bash
    npm run format # Runs prettier formatting
    ```
*   **Lint code manually:**
    ```bash
    npm run lint   # Checks ESLint rules
    ```

### Writing React Components
*   **Keep components modular:** Avoid creating files larger than **250-300 lines**. If your component is growing too large, extract logical parts into separate sub-components.
*   **State Management:** Standardize on **Zustand** for lightweight global states. Avoid introducing reciprocal Recoil states unless necessary for legacy consistency.
*   **Keep root directory clean:** Never commit physical backup files (e.g. `Component_old.jsx`) or temporary patch files to Git.

---

## 🚀 Branching & Pull Requests

1.  **Create a branch:**
    Use clear, descriptive branch prefixes:
    *   `feature/your-feature-name` (for new features)
    *   `bugfix/issue-description` (for bug fixes)
    *   `refactor/component-cleanup` (for refactoring)
2.  **Commit Messages:**
    Keep commit messages clear and concise:
    *   *Good:* `feat: add Google OAuth button to login screen`
    *   *Bad:* `fixed it` or `update code`
3.  **Submit PR:**
    Ensure that the GitHub Actions build passes on your branch before requesting review.
