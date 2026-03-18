<h1 align="center">DoxiTrak – Personal Finance Tracker</h1>

DoxiTrak is a modern, responsive personal finance dashboard built with React, Vite, and Tailwind CSS. It helps individuals track income and expenses, visualize spending patterns, set budgets and goals, and monitor key financial metrics in a clean, fintech-inspired UI.

## Features

- **Interactive dashboard** – Overview of balances, recent transactions, and key KPIs.
- **Transactions management** – Add, edit, and categorize income and expenses.
- **Budgets & goals** – Track spending against budgets and progress toward savings goals.
- **Analytics** – Charts and insights to understand where money goes over time.
- **Responsive layout** – Optimized for desktop and tablet viewports.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS, custom components
- **State management:** React Context (AppContext)

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Installation

From the repository root:

1. Change into the app directory:
	- `cd neonpay`
2. Install dependencies:
	- `npm install`

### Running the Development Server

From inside the `neonpay` directory:

1. Start the dev server:
	- `npm run dev`
2. Open the printed local URL in your browser (for example `http://localhost:5173` or the next available port shown in the terminal).

### Building for Production

From inside the `neonpay` directory:

1. Build the app:
	- `npm run build`
2. Preview the production build (optional):
	- `npm run preview`

## Project Structure

Key folders inside `neonpay/src`:

- `components/` – Reusable UI components such as Sidebar, Modal, StatCard, TechTicker, TransactionForm, and CustomTooltip.
- `pages/` – Route-level views: Dashboard, Analytics, Budget, Goals, Settings, and Transactions.
- `store/` – Global state and context (AppContext) for app-wide data.
- `utils/` – Finance-related utility functions (for calculations and helpers).

## Scripts

Common npm scripts (run from `neonpay`):

- `npm run dev` – Start the Vite development server.
- `npm run build` – Create a production build.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Run ESLint checks.

## License

This project is for personal and educational use. Adapt and extend it as needed for your own finance-tracking projects.
