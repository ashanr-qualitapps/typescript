import express from 'express';
import path from 'path';
import * as fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from a public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Create routes for TypeScript learning content
app.get('/api/topics', (req, res) => {
  res.json({
    topics: [
      'Type System Fundamentals',
      'Advanced Type Manipulation',
      'Learning Resources & Practice'
    ]
  });
});

// Function to parse the TOC from markdown file
function parseTOC(): string[] {
  try {
    const tocPath = path.join(__dirname, '..', 'toc.md');
    const tocContent = fs.readFileSync(tocPath, 'utf-8');
    
    // Extract only the links from the TOC section
    const tocLinks: string[] = [];
    const lines = tocContent.split('\n');
    
    // Find the TOC section and extract links
    let inTocSection = false;
    for (const line of lines) {
      if (line.startsWith('## Table of Contents')) {
        inTocSection = true;
        continue;
      }
      
      if (inTocSection && line.trim() === '') {
        break;  // End of TOC section
      }
      
      if (inTocSection && line.includes('](#')) {
        // Extract the title and the link
        const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const title = match[1];
          const link = match[2].replace('#', '');
          tocLinks.push(`${title}|${link}`);
        }
      }
    }
    
    return tocLinks;
  } catch (error) {
    console.error('Failed to read or parse TOC:', error);
    return [];
  }
}

// Generate HTML for the navigation page
function generateHTML(tocLinks: string[]): string {
  const links = tocLinks.map(link => {
    const [title, path] = link.split('|');
    return `<li><a href="/${path}">${title}</a></li>`;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TypeScript Learning Guide</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        a {
          color: #0066cc;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>TypeScript Learning Guide</h1>
      <p>Select a topic from the navigation below:</p>
      <ul>
        ${links}
      </ul>
    </body>
    </html>
  `;
}

// Function to get content for a specific topic
function getTopicContent(topicPath: string): string {
  try {
    // Try to load actual content from markdown files if available
    const contentPath = path.join(__dirname, '..', 'content', `${topicPath}.md`);
    
    // Check if the content file exists
    if (fs.existsSync(contentPath)) {
      const content = fs.readFileSync(contentPath, 'utf-8');
      
      // Convert markdown to simple HTML (in a real app, use a proper markdown parser)
      const htmlContent = content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${topicPath.replace(/-/g, ' ')} - TypeScript Learning Guide</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            pre {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 5px;
              overflow-x: auto;
            }
            .navigation {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="navigation">
            <p><a href="/">Back to Table of Contents</a></p>
          </div>
        </body>
        </html>
      `;
    }
    
    // Fallback to placeholder content if no file exists
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${topicPath.replace(/-/g, ' ')} - TypeScript Learning Guide</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <h1>${topicPath.replace(/-/g, ' ')}</h1>
        <p>Content for ${topicPath} would be displayed here.</p>
        <p><a href="/">Back to Table of Contents</a></p>
      </body>
      </html>
    `;
  } catch (error) {
    console.error(`Error getting content for ${topicPath}:`, error);
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Error - TypeScript Learning Guide</title>
        <style>
          body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1>Error</h1>
        <p class="error">Failed to load content for: ${topicPath}</p>
        <p><a href="/">Back to Table of Contents</a></p>
      </body>
      </html>
    `;
  }
}

// Main route to display TOC
app.get('/', (req, res) => {
  const tocLinks = parseTOC();
  const html = generateHTML(tocLinks);
  res.send(html);
});

// Route for topic content
app.get('/:topicPath', (req, res) => {
  const topicPath = req.params.topicPath;
  const html = getTopicContent(topicPath);
  res.send(html);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
  
  // 404 for anything else
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 Not Found - TypeScript Learning Guide</title>
      <style>
        body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>404 Not Found</h1>
      <p class="error">The requested page was not found.</p>
      <p><a href="/">Back to Table of Contents</a></p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the TypeScript Learning Guide at http://localhost:${PORT}/`);
});
