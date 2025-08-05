import express from 'express';
import path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and performance middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from a public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
    
    // Check if file exists first
    if (!fs.existsSync(tocPath)) {
      console.warn('TOC file not found:', tocPath);
      return [];
    }
    
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
    // Sanitize the path to prevent XSS
    const safePath = encodeURIComponent(path || '');
    const safeTitle = title ? title.replace(/[<>]/g, '') : 'Untitled';
    return `<li><a href="/${safePath}">${safeTitle}</a></li>`;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="TypeScript Learning Guide - Master TypeScript fundamentals and advanced concepts">
      <title>TypeScript Learning Guide</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          border-bottom: 3px solid #3498db;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        ul {
          padding-left: 0;
          list-style: none;
        }
        li {
          margin-bottom: 12px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 4px solid #3498db;
        }
        a {
          color: #2980b9;
          text-decoration: none;
          font-weight: 500;
        }
        a:hover {
          color: #1abc9c;
          text-decoration: underline;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #7f8c8d;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 TypeScript Learning Guide</h1>
        <p>Master TypeScript from fundamentals to advanced concepts. Select a topic to begin your journey:</p>
        <ul>
          ${links}
        </ul>
        <div class="footer">
          <p>Build with TypeScript • Express.js • Docker</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to get content for a specific topic
function getTopicContent(topicPath: string): string {
  try {
    // Sanitize the topic path
    const sanitizedPath = topicPath.replace(/[^a-zA-Z0-9-_]/g, '');
    const contentPath = path.join(__dirname, '..', 'content', `${sanitizedPath}.md`);
    
    // Check if the content file exists
    if (fs.existsSync(contentPath)) {
      const content = fs.readFileSync(contentPath, 'utf-8');
      
      // Enhanced markdown to HTML conversion
      const htmlContent = content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/``````/gs, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[h|p|u|o|d])(.+)$/gm, '<p>$1</p>');
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${sanitizedPath.replace(/-/g, ' ')} - TypeScript Learning Guide</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1, h2, h3 {
              color: #2c3e50;
              border-bottom: 2px solid #ecf0f1;
              padding-bottom: 10px;
              margin-top: 30px;
            }
            h1 { border-bottom-color: #3498db; }
            a {
              color: #2980b9;
              text-decoration: none;
            }
            a:hover { color: #1abc9c; }
            pre {
              background-color: #2d3748;
              color: #e2e8f0;
              padding: 20px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 20px 0;
            }
            code {
              background-color: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Monaco', 'Consolas', monospace;
            }
            .navigation {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ecf0f1;
              text-align: center;
            }
            .nav-button {
              display: inline-block;
              background: #3498db;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              transition: background 0.3s;
            }
            .nav-button:hover {
              background: #2980b9;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${htmlContent}
            <div class="navigation">
              <a href="/" class="nav-button">← Back to Table of Contents</a>
            </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autoloader/prism-autoloader.min.js"></script>
        </body>
        </html>
      `;
    }
    
    // Enhanced fallback content
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${sanitizedPath.replace(/-/g, ' ')} - TypeScript Learning Guide</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #f39c12;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .placeholder {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .nav-button {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 20px;
          }
          .nav-button:hover {
            background: #2980b9;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📝 ${sanitizedPath.replace(/-/g, ' ')}</h1>
          <div class="placeholder">
            <p><strong>Content Coming Soon!</strong></p>
            <p>This topic is part of our TypeScript learning curriculum and will be available soon.</p>
            <p>Topic: <em>${sanitizedPath}</em></p>
          </div>
          <a href="/" class="nav-button">← Back to Table of Contents</a>
        </div>
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
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: #f8f9fa;
          }
          .error-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            border-left: 5px solid #e74c3c;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .error { color: #e74c3c; }
          .nav-button {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>⚠️ Error</h1>
          <p class="error">Failed to load content for: <strong>${topicPath}</strong></p>
          <p>Please check if the content file exists or contact support.</p>
          <a href="/" class="nav-button">← Back to Table of Contents</a>
        </div>
      </body>
      </html>
    `;
  }
}

// Main route to display TOC
app.get('/', (req, res) => {
  try {
    const tocLinks = parseTOC();
    const html = generateHTML(tocLinks);
    res.send(html);
  } catch (error) {
    console.error('Error serving homepage:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for topic content
app.get('/:topicPath', (req, res) => {
  try {
    const topicPath = req.params.topicPath;
    
    // Basic validation
    if (!topicPath || topicPath.length > 100) {
      return res.status(400).send('Invalid topic path');
    }
    
    const html = getTopicContent(topicPath);
    res.send(html);
  } catch (error) {
    console.error('Error serving topic content:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler - this must come after all other routes
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 Not Found - TypeScript Learning Guide</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 20px; 
          max-width: 800px; 
          margin: 0 auto; 
          background-color: #f8f9fa;
        }
        .error-container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .error { color: #e74c3c; }
        .nav-button {
          display: inline-block;
          background: #3498db;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>🔍 404 Not Found</h1>
        <p class="error">The requested page was not found.</p>
        <p>Path: <code>${req.url}</code></p>
        <a href="/" class="nav-button">← Back to Table of Contents</a>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📚 Access the TypeScript Learning Guide at http://localhost:${PORT}/`);
  console.log(`💚 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
