'use server'
import { parse } from 'node-html-parser';
export async function scrape(userId:string) {

    const url = `https://forkyou.dev/user/${userId}`;
    console.log(`Fetching data from URL: ${url}`);

    const data = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html',
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.204 Safari/537.36',
            'Origin': 'https://forkyou.dev',
            'Referer': url,
        }
    });
    const jsonData = await data.text();
    if (!jsonData) {
        console.error("No response received from the URL");
        return { error: "No data found" };
    }
    const parsed = parse(jsonData);
    const LeaderBoardElement = parsed.querySelectorAll(
        ".rounded-xl.border.bg-card.text-card-foreground.overflow-hidden.border-none.shadow-lg"
      )[4];
    
    const leaderBoard = LeaderBoardElement.innerHTML;
    console.log(`Parsed LeaderBoard HTML: ${leaderBoard.replace(` <div class="h-1.5 bg-gradient-to-r from-primary to-accent -mt-6"></div>`, '')}`); // Log the cleaned HTML for debugging
    return leaderBoard
}

export async function generateMatrix(html: string) {
    const matrix: { [key: number]: (number | null)[] } = {};
    const parsed = parse(html);
    
    // Find the main grid container
    const gridContainer = parsed.querySelector('.grid.grid-flow-col');
    
    if (!gridContainer) {
        console.error("Grid container not found");
        return matrix;
    }
    
    // Get all column divs (each column represents a week)
    const columns = gridContainer.querySelectorAll('.flex.flex-col');
    
    columns.forEach((column, columnIndex) => {
        const columnData: (number | null)[] = [];
        
        // Get all day cells in this column (should be 7 days)
        const dayCells = column.querySelectorAll('.w-8.h-8.rounded-md');
        
        dayCells.forEach((dayCell) => {
            let activityLevel: number | null = null;
            
            const classList = dayCell.getAttribute('class') || '';
            const style = dayCell.getAttribute('style') || '';
            
            // Check for different activity levels based on CSS classes
            if (classList.includes('border-none') && !classList.includes('bg-')) {
                // No activity
                activityLevel = -1;
            } else if (classList.includes('bg-muted/30')) {
                // Low activity
                activityLevel = 0;
            } else if (classList.includes('bg-primary')) {
                // High activity - extract opacity value
                const opacityMatch = style.match(/opacity:\s*([\d.]+)/);
                if (opacityMatch) {
                    activityLevel = parseFloat(opacityMatch[1]);
                } else {
                    activityLevel = -1; // Default if no opacity specified
                }
            } else {
                // Fallback for any other cases
                activityLevel = -1;
            }
            
            columnData.push(activityLevel);
        });
        
        matrix[columnIndex] = columnData;
    });
    
    console.log('Generated matrix:', matrix);
    return matrix;
}
