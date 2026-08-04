import { NextRequest, NextResponse } from 'next/server';

let cachedDuckBackendUrl = '';
let lastFetchTime = 0;

async function getDuckBackendUrl(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedDuckBackendUrl && now - lastFetchTime < 5000) {
    return cachedDuckBackendUrl;
  }
  try {
    const res = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf?t=' + now, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.duckBackendUrl) {
        cachedDuckBackendUrl = data.duckBackendUrl.trim();
        lastFetchTime = now;
      }
    }
  } catch (e) {}
  return cachedDuckBackendUrl || 'http://localhost:8000';
}

export async function proxyToDuck(req: NextRequest, endpoint: string) {
  try {
    let backendUrl = await getDuckBackendUrl();
    let targetUrl = backendUrl.replace(/\/$/, '') + endpoint;
    
    const headers: Record<string, string> = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'accept': 'application/json, text/plain, */*',
      'bypass-tunnel-reminder': 'true'
    };
    
    const method = req.method;
    let body: any = null;
    if (method !== 'GET' && method !== 'HEAD') {
      body = await req.text();
      headers['content-type'] = req.headers.get('content-type') || 'application/json';
    }

    let targetRes: Response;
    try {
      targetRes = await fetch(targetUrl, {
        method,
        headers,
        body,
        cache: 'no-store'
      });
      if (!targetRes.ok && targetRes.status === 502) {
        throw new Error('502 Bad Gateway');
      }
    } catch (fetchErr) {
      backendUrl = await getDuckBackendUrl(true);
      targetUrl = backendUrl.replace(/\/$/, '') + endpoint;
      targetRes = await fetch(targetUrl, {
        method,
        headers,
        body,
        cache: 'no-store'
      });
    }

    const resData = await targetRes.arrayBuffer();
    return new NextResponse(resData, {
      status: targetRes.status,
      headers: {
        'content-type': targetRes.headers.get('content-type') || 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Duck proxy error: ' + err.message }, { status: 500 });
  }
}
