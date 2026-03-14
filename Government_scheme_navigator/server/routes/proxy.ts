import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  const targetUrl = req.query.url as string;
  
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const response = await axios.get(targetUrl, { 
      responseType: 'arraybuffer',
      // We don't want axios to throw on 4xx/5xx, we just want to proxy it
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const contentType = response.headers['content-type'];
    
    // Copy safe headers
    for (const [key, value] of Object.entries(response.headers)) {
      const lowerKey = key.toLowerCase();
      // Skip headers that prevent embedding or chunking issues
      if (!['x-frame-options', 'content-security-policy', 'transfer-encoding', 'content-length'].includes(lowerKey)) {
        res.set(key, value as string);
      }
    }

    if (contentType && contentType.includes('text/html')) {
      let html = response.data.toString('utf8');
      
      try {
        const urlObj = new URL(targetUrl);
        // Ensure paths like /path/to/page resolve correctly
        const baseHref = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        const baseTag = `<base href="${baseHref}">`;
        
        // Inject <base> tag right after <head> or at the start if missing
        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>\n  ${baseTag}`);
        } else if (html.includes('<head ')) {
          html = html.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}`);
        } else {
          html = baseTag + '\n' + html;
        }
      } catch (e) {
        console.error('URL parse error in proxy:', e);
      }
      
      return res.send(html);
    }

    return res.send(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return res.status(500).send(`Proxy error: ${error.message}`);
  }
});

export default router;
