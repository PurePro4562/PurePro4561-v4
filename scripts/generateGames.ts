import fs from 'fs';
import path from 'path';

const treeText = fs.readFileSync('parse-tree.js', 'utf8');

const lines = treeText.split('\n');
const games = [];

for (const line of lines) {
  if (line.startsWith('├──') || line.startsWith('└──')) {
    const match = line.match(/├──\s+(.+)\//) || line.match(/└──\s+(.+)\//);
    if (match) {
      const id = match[1];
      // Skip common non-game directories
      if (['img', 'icons', 'images', 'assets', 'assets/img', 'waterworks'].includes(id)) continue;
      
      const title = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      games.push({
        id,
        title,
        url: `https://rawcdn.githack.com/GalacticNetwork/3kh0-assets/f269ea64b9e2ff923e59ab3ea7c6b4b57c437af2/${id}/index.html`,
        image: `https://rawcdn.githack.com/GalacticNetwork/3kh0-assets/f269ea64b9e2ff923e59ab3ea7c6b4b57c437af2/${id}/splash.png`,
        category: 'Arcade',
        players: '100k',
        status: 'ONLINE',
        color: 'from-blue-500 to-cyan-500'
      });
    }
  }
}

fs.writeFileSync('src/externalGames.json', JSON.stringify(games, null, 2));
console.log(`Generated ${games.length} games.`);
