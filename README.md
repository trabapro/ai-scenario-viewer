# AI Scenario Viewer

Visualize and compare AI scenario test results. Built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- **Drag-and-drop loading** — drop a `latest.json` result file or use the bundled sample data
- **Dashboard** — scenario and criteria pass rates, summary stats, filterable scenario grid
- **Conversation viewer** — chat-bubble UI showing agent/user exchanges per scenario
- **Evaluation criteria** — pass/fail table with expandable LLM evaluator reasons
- **Multi-run comparison** — time series charts, scenario diff tables, and delta cards across uploads
- **Dark mode** — toggle with system preference detection
- **localStorage persistence** — results survive page refreshes and navigation, with history of past uploads

## Getting Started

```bash
npm install
npm run dev
```

Opens on [http://localhost:3456](http://localhost:3456).

## Usage

1. Run your AI scenario tests in `traba-server-node` to produce a `latest.json` result file
2. Open the viewer and drag the JSON file onto the drop zone (or click "Load Sample Data")
3. Click any scenario card to view the full conversation and evaluation criteria
4. Upload multiple result files over time, then click "Compare Runs" to see trends and diffs

## Tech Stack

- [Vite](https://vite.dev) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Router v7](https://reactrouter.com)
- Pure SVG charts (no charting library)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3456 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
