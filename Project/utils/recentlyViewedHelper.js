const fs = require("node:fs/promises");
const path = require("path"); 

const filePath = path.join(__dirname, "..", "data", "recentlyViewed.json")

async function readRecentlyViewedFile(){ 
    try{ 
        const data = await fs.readFile(filePath, "utf-8"); 
        return JSON.parse(data || "{}"); 
    } catch(err){
        return {};
    }
}

async function writeRecentlyViewedFile(data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function addRecentlyViewed(userId, movie) {
    if (!userId) return;

    const data = await readRecentlyViewedFile();

    if (!data[userId]) {
        data[userId] = [];
    }

    data[userId] = data[userId].filter(item => item.id !== movie.id);

    data[userId].unshift(movie);

    data[userId] = data[userId].slice(0, 10);

    await writeRecentlyViewedFile(data); 
} 

async function getRecentlyViewed(userId){ 
    if(!userId) return []; 
    const data = await readRecentlyViewedFile(); 
    return data[userId] || []; 
}

async function clearRecentlyViewed(userId){ 
    let data = {}; 

    try{ 
        const file = await fs.readFile(filePath, "utf-8"); 
        data = JSON.parse(file); 
    } catch { 
        data = {}; 
    }

    delete data[userId]; 
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

module.exports = { 
    addRecentlyViewed, 
    getRecentlyViewed, 
    clearRecentlyViewed
}