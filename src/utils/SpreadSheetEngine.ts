  export type CellData = {
    raw: string;
    computed: string | number;
    error: string | null;
  };

  type Subscriber = () => void;

  export class SpreadsheetEngine {
    private cells = new Map<string, CellData>();
    private dependencies = new Map<string, Set<string>>();
    private dependents = new Map<string, Set<string>>();
    private subscribers = new Set<Subscriber>();

    // Regex to match cell IDs (A1 to J10)
    private cellRegex = /[A-J](10|[1-9])/g;

    constructor() {
      // Initialize 10x10 grid
      for (let col = 0; col < 10; col++) {
        const colChar = String.fromCharCode(65 + col);
        for (let row = 1; row <= 10; row++) {
          const id = `${colChar}${row}`;
          this.cells.set(id, { raw: '', computed: '', error: null });
          this.dependencies.set(id, new Set());
          this.dependents.set(id, new Set());
        }
      }
    }

    public getCell(id: string): CellData {
      return this.cells.get(id) || { raw: '', computed: '', error: null };
    }

    public setCellValue(id: string, raw: string) {
      const cell = this.getCell(id);
      cell.raw = raw;
      cell.error = null;

      if (raw.startsWith('=')) {
        const parsedFormula = this.expandRanges(raw.substring(1).toUpperCase());
        const newDeps = new Set(parsedFormula.match(this.cellRegex) || []);

      if (this.detectCycle(id, newDeps)) {
        cell.error = '#CYCLE!';
        cell.computed = '#CYCLE!';
        
        // Cascade the failure down to dependents before returning
        const deps = this.dependents.get(id) || new Set();
        deps.forEach(dep => this.recompute(dep));
        
        this.notify();
        return;
      }

        this.updateDependencies(id, newDeps);
      } else {
        this.updateDependencies(id, new Set()); // Clear deps if plain text
        cell.computed = isNaN(Number(raw)) || raw === '' ? raw : Number(raw);
      }

      this.recompute(id);
      this.notify();
    }

    private expandRanges(formula: string): string {
      // Converts SUM(A1:A3) to (A1,A2,A3) -> then we handle the sum logic in evaluate
      return formula.replace(/SUM\(([A-J](?:10|[1-9]))?:([A-J](?:10|[1-9]))?\)/g, (_match, start, end) => {
        const startCol = start.charCodeAt(0);
        const endCol = end.charCodeAt(0);
        const startRow = parseInt(start.substring(1));
        const endRow = parseInt(end.substring(1));
        
        const cellsInRange = [];
        for (let c = startCol; c <= endCol; c++) {
          for (let r = startRow; r <= endRow; r++) {
            cellsInRange.push(`${String.fromCharCode(c)}${r}`);
          }
        }
        return cellsInRange.length ? `(${cellsInRange.join('+')})` : '0';
      });
    }

    private detectCycle(targetId: string, newDependencies: Set<string>): boolean {
      const visited = new Set<string>();
      const recStack = new Set<string>();

      const dfs = (currentNode: string): boolean => {
        if (recStack.has(currentNode)) return true; // Cycle found
        if (visited.has(currentNode)) return false;

        visited.add(currentNode);
        recStack.add(currentNode);

        const deps = currentNode === targetId ? newDependencies : this.dependencies.get(currentNode) || new Set();
        
        for (const dep of deps) {
          if (dfs(dep)) return true;
        }

        recStack.delete(currentNode);
        return false;
      };

      return dfs(targetId);
    }

    private updateDependencies(id: string, newDeps: Set<string>) {
      const currentDeps = this.dependencies.get(id) || new Set();
      
      // Remove old dependents
      currentDeps.forEach(dep => {
        if (!newDeps.has(dep)) {
          this.dependents.get(dep)?.delete(id);
        }
      });

      // Add new dependents
      newDeps.forEach(dep => {
        if (!currentDeps.has(dep)) {
          this.dependents.get(dep)?.add(id);
        }
      });

      this.dependencies.set(id, newDeps);
    }

    private recompute(id: string) {
      const cell = this.getCell(id);
      
      if (cell.raw.startsWith('=')) {
        try {
          let formula = this.expandRanges(cell.raw.substring(1).toUpperCase());
          
          // Replace cell IDs with actual values
          formula = formula.replace(this.cellRegex, (match) => {
            const val = this.getCell(match).computed;
            return val === '' ? '0' : String(val);
          });

          // Safe evaluation using bound Function (prevents global scope access)
          const compute = new Function(`return ${formula}`);
          const result = compute();
          cell.computed = isNaN(result) ? '#VALUE!' : result;
          cell.error = null;
        } catch (e) {
          cell.computed = '#ERROR!';
          cell.error = '#ERROR!';
        }
      }

      // Topological recalculation of dependents
      const deps = this.dependents.get(id) || new Set();
      deps.forEach(dep => this.recompute(dep));
    }

   public subscribe(fn: Subscriber) {
      this.subscribers.add(fn);
      return () => { this.subscribers.delete(fn); };
    }

    private notify() {
      this.subscribers.forEach(fn => fn());
    }
  }

  export const engine = new SpreadsheetEngine();
