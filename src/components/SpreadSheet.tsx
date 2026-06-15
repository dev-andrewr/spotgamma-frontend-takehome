import React, { useState, useEffect, useCallback } from 'react';
import { engine } from '../utils/SpreadSheetEngine';
import '../styles/SpreadSheet.css';

const COLS = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)); // A-J
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1); // 1-10

export const Spreadsheet: React.FC = () => {
  const [, setTick] = useState(0);
  const [activeCell, setActiveCell] = useState<string | null>(null);

  // Subscribe to engine changes to trigger re-renders
  useEffect(() => engine.subscribe(() => setTick(t => t + 1)), []);

  const handleCellBlur = useCallback((id: string, value: string) => {
    setActiveCell(null);
    engine.setCellValue(id, value);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="spreadsheet-container">
      <div className="grid-header-corner"></div>
      {COLS.map(col => (
        <div key={col} className="grid-header-col">{col}</div>
      ))}

      {ROWS.map(row => (
        <React.Fragment key={row}>
          <div className="grid-header-row">{row}</div>
          {COLS.map(col => {
            const id = `${col}${row}`;
            const cellData = engine.getCell(id);
            const isEditing = activeCell === id;

            return (
              <div 
                key={id} 
                className={`grid-cell ${cellData.error ? 'cell-error' : ''}`}
                onClick={() => setActiveCell(id)}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={cellData.raw}
                    onBlur={(e) => handleCellBlur(id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    className="cell-input"
                  />
                ) : (
                  <span className="cell-display">
                    {cellData.computed}
                  </span>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
