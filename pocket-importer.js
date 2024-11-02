// pocket-importer.js
import fs from 'fs';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Pocket API configuration
const POCKET_CONSUMER_KEY = 'YOUR_CONSUMER_KEY'; // Get this from https://getpocket.com/developer/
const POCKET_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // Get this after OAuth authentication

async function importBookmarksToPocket(inputFile) {
    // Read the bookmarks HTML file
    const bookmarksHtml = fs.readFileSync(inputFile, 'utf8');
    const dom = new JSDOM(bookmarksHtml);
    const document = dom.window.document;

    // Find all bookmark links
    const bookmarks = document.querySelectorAll('a');
    console.log(`Found ${bookmarks.length} bookmarks to process`);

    // Process each bookmark
    for (const bookmark of bookmarks) {
        const url = bookmark.href;
        if (!url || url.startsWith('javascript:') || url.startsWith('file:')) {
            continue; // Skip invalid or local URLs
        }

        // Get existing tags from the TAGS attribute (common in some exports)
        const existingTags = bookmark.getAttribute('tags') || '';
        
        // Get folder structure as additional tags
        const folderTags = getBookmarkPath(bookmark);
        
        // Combine and clean tags
        const allTags = [...new Set([
            ...existingTags.split(',').map(t => t.trim()),
            ...folderTags.split(',').map(t => t.trim())
        ])]
        .filter(tag => tag && tag.length > 0)
        .map(tag => tag.replace(/\s+/g, '_')); // Pocket prefers underscores in tags

        try {
            // Add to Pocket
            await addToPocket(url, bookmark.textContent, allTags);
            console.log(`✓ Added: ${bookmark.textContent}`);
            
            // Add a small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`✗ Failed to add ${url}: ${error.message}`);
        }
    }
}

function getBookmarkPath(bookmark) {
    const folders = [];
    let parent = bookmark.parentElement;
    
    // Traverse up the DOM to collect folder names
    while (parent) {
        if (parent.tagName === 'DL' && parent.previousElementSibling) {
            const folderName = parent.previousElementSibling.textContent.trim();
            if (folderName && !['Bookmarks', 'Favorites', 'Bookmarks bar'].includes(folderName)) {
                folders.unshift(folderName.replace(/[",]/g, ' ').trim());
            }
        }
        parent = parent.parentElement;
    }
    
    return folders.join(',');
}

async function addToPocket(url, title, tags) {
    const response = await fetch('https://getpocket.com/v3/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Accept': 'application/json'
        },
        body: JSON.stringify({
            url,
            title,
            tags: tags.join(','),
            consumer_key: POCKET_CONSUMER_KEY,
            access_token: POCKET_ACCESS_TOKEN
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();


// Command line interface
if (process.argv.length !== 3) {
    console.log('Usage: node pocket-importer.js <bookmarks.html>');
    process.exit(1);
}

const inputFile = process.argv[2];
importBookmarksToPocket(inputFile)
    .then(() => console.log('Import completed!'))
    .catch(error => console.error('Import failed:', error));
