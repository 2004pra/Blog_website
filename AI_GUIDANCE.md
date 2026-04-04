# AI Guidance and Prompting Rules

This document outlines the AI guidance, rules, and constraints used to generate the frontend of this application, as well as instructions for future AI collaborations.

## 1. AI Usage Scope
- **Backend (`Backend/`)**: **Strictly NO AI**. The backend was 100% human-written. AI should not be prompted to modify, refactor, or generate code in the backend directory.
- **Frontend (`Frontend/`)**: The frontend was created entirely using **Claude Haiku 4.5**. AI is the primary tool for maintaining, styling, and updating the frontend.

## 2. Frontend Coding Standards & Constraints
When prompting the AI to maintain or update the Frontend, the following rules apply:
- **Tech Stack**: React with Vite (`App.jsx`, `main.jsx`).
- **Styling**: Use standard CSS files located in `Frontend/src/styles/` rather than inline styles or utility frameworks like Tailwind (unless explicitly asked to migrate).
- **State Management**: Utilize React Hooks (`useState`, `useEffect`) and Context API (`AuthContext.jsx` for user authentication state).
- **Component Structure**: Keep components functional and modular, placing them inside `Frontend/src/components/`.
- **API Integration**: All backend communications must be routed through `Frontend/src/api.js`.

## 3. Prompting Guidelines
To ensure consistency when using Claude or other AI agents on the frontend:
1. **Provide Context**: Always attach `api.js` when asking the AI to build new features that require data fetching.
2. **Be Specific**: Specify which CSS file needs updates to avoid the AI creating redundant styles.
3. **Respect Boundaries**: Start prompts focusing on the frontend with a reminder: *"Do not modify the backend code. This task is strictly for the React frontend."*
4. **Error Handling**: Prompt the AI to gracefully handle API connection errors and provide user-friendly feedback on the UI (especially for login/signup flows).
