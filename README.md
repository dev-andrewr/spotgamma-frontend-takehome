
# Live-Calculating Matrix UI (Spreadsheet Clone)

A high-performance, real-time spreadsheet web application built for the SpotGamma Frontend Engineering assessment.

**Live Demo:** [Insert Your GitHub Pages URL Here]

## 🚀 Features

* **10x10 Editable Grid:** Rendered strictly with CSS Grid, featuring columns A-J and rows 1-10.
* **Real-Time Formula Evaluation:** Supports raw text, basic arithmetic (`=A1 + B2`), and range functions (`=SUM(A1:A5)`).
* **Circular Dependency Protection:** Implements a Directed Acyclic Graph (DAG) with Depth-First Search (DFS) cycle detection to prevent infinite loops and safely block invalid updates (`#CYCLE!`).
* **High Performance:** Decouples the business logic from the React view layer. Cell updates only recalculate explicitly dependent nodes, preventing O(n) cascading re-renders across the grid.
* **Modern UI/UX:** Styled to resemble native spreadsheet software with fixed dimensions, active cell highlighting, and overflow text handling.

## 🛠 Tech Stack

* **Core:** React 18, TypeScript, Vite
* **State & Logic:** Vanilla TypeScript (Custom reactive Dependency Graph)
* **Styling:** Plain CSS (CSS Grid, CSS Variables)
* **Deployment:** GitHub Pages

## 🧠 Architectural Approach

### 1. State Management & The "Engine"
Instead of tying spreadsheet data directly to React state (which would trigger massive re-renders on every keystroke), the core logic lives in a plain TypeScript class called `SpreadsheetEngine`. This engine acts as a custom reactive store. React only subscribes to high-level update "ticks" from the engine to know when to re-render the view.

### 2. The Dependency Graph
Mathematical relationships between cells are modeled as a Graph. 
* When a formula is parsed, the engine maps **Dependencies** (what a cell relies on) and **Dependents** (who relies on this cell).
* If `A1` is updated, the engine does not recalculate the whole grid. It performs a targeted topological update solely on `A1`'s dependents, resulting in zero input lag.

### 3. Safe Evaluation & Cycle Detection
* **Cycles:** Before any formula is committed to state, a DFS algorithm runs ahead to check for circular references (e.g., A1 -> B1 -> A1). If a cycle is detected, the evaluation is safely aborted.
* **Evaluation:** Math is evaluated using a strictly bound `new Function("return ...")()` rather than the insecure global `eval()`.

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_GITHUB_NAME/spotgamma-frontend-takehome.git](https://github.com/YOUR_GITHUB_NAME/spotgamma-frontend-takehome.git)
   cd spotgamma-frontend-takehome

2. **Install dependancies:**
`npm install`

3. **Start the development server:**
`npm run dev`

4.**Build for production:**
`npm run build`
