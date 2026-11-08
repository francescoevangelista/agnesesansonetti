// Vercel Routing Middleware, home page only.
// 1. A lang cookie (set by the IT / EN switch) decides.
// 2. Without it: no Accept-Language, or Italian as first language, stays on / (Italian).
// 3. Anything else goes to /en/ with a temporary redirect.
export const config = { matcher: '/' };

export default function middleware(request) {
  const cookie = request.headers.get('cookie') || '';
  const chosen = cookie.match(/(?:^|;\s*)lang=(it|en)(?:;|$)/)?.[1];
  let lang = chosen;
  if (!lang) {
    const first = (request.headers.get('accept-language') || '').split(',')[0].trim().toLowerCase();
    lang = !first || first === '*' || first.startsWith('it') ? 'it' : 'en';
  }
  if (lang === 'en') {
    const url = new URL('/en/', request.url);
    url.search = new URL(request.url).search;
    return Response.redirect(url, 302);
  }
  // Returning nothing lets the request continue to the static Italian home.
}
