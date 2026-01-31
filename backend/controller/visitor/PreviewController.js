const PREVIEW_TIMEOUT_MS = 8000;
const MAX_HTML_LENGTH = 150000;

export function isValidPreviewUrl(str) {
  if (typeof str !== 'string' || !str.trim()) return false;
  try {
    const u = new URL(str.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractMeta(html) {
  const result = { title: null, description: null, image: null };
  if (!html || typeof html !== 'string') return result;

  const patterns = [
    { key: 'title', regex: /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i },
    { key: 'title', regex: /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i },
    { key: 'description', regex: /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i },
    { key: 'description', regex: /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i },
    { key: 'image', regex: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i },
    { key: 'image', regex: /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i },
  ];

  for (const { key, regex } of patterns) {
    const m = html.match(regex);
    if (m && m[1] && !result[key]) {
      result[key] = m[1].trim().replace(/&amp;/g, '&');
    }
  }

  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      result.title = titleMatch[1].trim().replace(/&amp;/g, '&');
    }
  }

  if (result.image && result.image.startsWith('//')) {
    result.image = 'https:' + result.image;
  }

  return result;
}

/** Resolve relative image URL to absolute using the page URL. */
function resolveImageUrl(imageUrl, pageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  try {
    return new URL(trimmed, pageUrl).href;
  } catch {
    return trimmed;
  }
}

export async function getPreview(req, res) {
  const rawUrl = req.query.url;
  if (!isValidPreviewUrl(rawUrl)) {
    return res.status(400).json({ error: 'Invalid or missing url parameter' });
  }

  const targetUrl = rawUrl.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PREVIEW_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(404).json({ error: 'Page not found or unavailable' });
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('text/html')) {
      return res.status(400).json({ error: 'URL is not an HTML page' });
    }

    const html = await response.text();
    const limited = html.length > MAX_HTML_LENGTH ? html.slice(0, MAX_HTML_LENGTH) : html;
    const meta = extractMeta(limited);
    // Resolve relative og:image to absolute so <img src> works from our domain
    if (meta.image) {
      meta.image = resolveImageUrl(meta.image, targetUrl);
    }

    res.json(meta);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    res.status(500).json({ error: 'Failed to fetch preview' });
  }
}
