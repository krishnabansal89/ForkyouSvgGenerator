
import { ReactNode } from 'react';

type ActivityMatrix = Record<string, number[]>;

interface Props {
  matrix: ActivityMatrix;
}

export function generateActivityGrid({ matrix }: Props): ReactNode {
  // Adjust these as per your image/brand colors:
  const borderColor = '#604553';

  // The last column may contain non-binary values
  const numCols = Object.keys(matrix).length;
  const numRows = Math.max(...Object.values(matrix).map((arr) => arr.length));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        padding: 8,
        overflowX: 'auto',
        background: '#20151e', // card bg from your screenshot
        borderRadius: 20,
      }}
    >
      {Array.from({ length: numCols }).map((_, colIdx) => (
        <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: numRows }).map((_, rowIdx) => {
            const val = matrix[colIdx.toString()]?.[rowIdx] ?? 0;
            // If value is close to 1 (>=0.99), treat as fully active (main color)
            const isActive = val >= 0;
            return (
              <div
              // Hide empty boxes
                key={rowIdx}
                style={{
                    
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: !isActive ? `rgb(240, 139, 105 , 0)` : `rgb(240, 139, 105 , ${val})`, // Use opacity for active boxes
                  opacity: 1,
                  border: val>=0 ? `1px solid ${borderColor}` : "0px ",
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  // Optionally add a shadow if you want (Satori supports it)
                  boxShadow: isActive ? '0 2px 8px #0002' : '0px 0px 0px 0px',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
