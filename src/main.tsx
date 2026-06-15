import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Spreadsheet } from './components/SpreadSheet.tsx'
import './styles/Spreadsheet.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{
      width: "100vw",
      height: "90vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Spreadsheet />
    </div>
  </StrictMode>,
)
