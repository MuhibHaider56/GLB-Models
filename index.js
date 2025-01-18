const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer'); // Add Puppeteer for scraping

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "models" folder
app.use('/models', express.static(path.join(__dirname, 'models')));

// API to retrieve specific .glb files
app.get('/getModel/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'models', fileName);

    // Validate file extension
    if (!fileName.endsWith('.glb')) {
        return res.status(400).send('Invalid file type. Only .glb files are allowed.');
    }

    // Serve the file if it exists
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// Function to scrape GLB models using Puppeteer
async function scrapeGLBModels(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the page and wait for content to load
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Scrape the page for .glb model links
    const glbLinks = await page.evaluate(() => {
        const links = [];
        // Look for anchor tags or other relevant elements with .glb links
        document.querySelectorAll('a').forEach((link) => {
            if (link.href && link.href.includes('.glb')) {
                links.push(link.href);
            }
        });
        return links;
    });

    await browser.close();
    return glbLinks;
}

// API to get .glb models from a website
app.get('/get-glb-models', async (req, res) => {
    const websites = [
        "https://example-website-1.com/3d-models", // Replace with real URLs
        "https://example-website-2.com/models"
    ];

    let allModels = [];

    for (const website of websites) {
        const glbModels = await scrapeGLBModels(website);
        allModels = allModels.concat(glbModels);
    }

    res.json(allModels);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// const express = require('express');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Serve static files from the "models" folder
// app.use('/models', express.static(path.join(__dirname, 'models')));

// // API to retrieve specific .glb files
// app.get('/getModel/:fileName', (req, res) => {
//     const fileName = req.params.fileName;
//     const filePath = path.join(__dirname, 'models', fileName);

//     // Validate file extension
//     if (!fileName.endsWith('.glb')) {
//         return res.status(400).send('Invalid file type. Only .glb files are allowed.');
//     }

//     // Serve the file if it exists
//     res.sendFile(filePath, (err) => {
//         if (err) {
//             res.status(404).send('File not found');
//         }
//     });
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
