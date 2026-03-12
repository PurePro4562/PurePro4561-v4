const fs = require('fs');
const paths = fs.readFileSync('paths.txt', 'utf-8').split('\n').filter(Boolean);
const gamesMap = {};

for (let p of paths) {
    const cleanPath = p.replace(/^\.\//, '');
    const parts = cleanPath.split('/');
    if (parts.length < 2) continue;
    if (cleanPath.startsWith('.git')) continue;
    
    const gameDir = parts[0];
    if (!gamesMap[gameDir]) gamesMap[gameDir] = [];
    gamesMap[gameDir].push(cleanPath);
}

const games = [];
const commitHash = 'f269ea64b9e2ff923e59ab3ea7c6b4b57c437af2';
const baseUrl = `https://rawcdn.githack.com/GalacticNetwork/3kh0-assets/${commitHash}/`;

const colors = [
  'from-purple-500 to-pink-500',
  'from-lime-500 to-emerald-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-amber-500 to-orange-500'
];

let colorIndex = 0;

for (let [dir, files] of Object.entries(gamesMap)) {
    let htmlFile = files.find(f => f === `${dir}/index.html`);
    if (!htmlFile) {
        htmlFile = files.find(f => f.endsWith('.html') && f.split('/').length === 2);
    }
    
    if (htmlFile) {
        let imgFile = files.find(f => f.match(/\.(png|jpg|jpeg|gif|webp)$/i) && f.split('/').length === 2 && !f.includes('favicon'));
        if (!imgFile) imgFile = files.find(f => f.match(/\.(png|jpg|jpeg|gif|webp)$/i) && !f.includes('favicon'));
        
        let title = dir.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        games.push({
            id: dir,
            title: title,
            url: baseUrl + htmlFile,
            image: imgFile ? (baseUrl + imgFile) : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=60',
            category: 'Arcade',
            players: Math.floor(Math.random() * 900 + 10) + 'k',
            status: 'ONLINE',
            color: colors[colorIndex % colors.length]
        });
        colorIndex++;
    }
}

fs.writeFileSync('src/externalGames.json', JSON.stringify(games, null, 2));
console.log(`Extracted ${games.length} games!`);
