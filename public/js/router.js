// ===========================================
// Loan Tracker — SPA Router
// Lightweight pushState-based routing
// ===========================================

const routes = [];
let currentCleanup = null;

/**
 * Register a route with a path pattern and handler
 * Supports :param style dynamic segments
 */
export function addRoute(pattern, handler) {
  const paramNames = [];
  const regexStr = pattern
    .replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
  const regex = new RegExp(`^${regexStr}$`);
  routes.push({ pattern, regex, paramNames, handler });
}

/**
 * Navigate to a path
 */
export function navigate(path, { replace = false } = {}) {
  if (replace) {
    history.replaceState(null, '', path);
  } else {
    history.pushState(null, '', path);
  }
  resolve();
}

/**
 * Go back
 */
export function goBack() {
  history.back();
}

/**
 * Resolve the current path against registered routes
 */
export function resolve() {
  const path = location.pathname;

  // Run cleanup from previous route
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      const cleanup = route.handler(params);
      if (typeof cleanup === 'function') {
        currentCleanup = cleanup;
      }
      return;
    }
  }

  // Fallback: navigate home
  navigate('/', { replace: true });
}

/**
 * Initialize the router
 */
export function initRouter() {
  // Handle popstate (back/forward)
  window.addEventListener('popstate', () => resolve());

  // Intercept link clicks for SPA navigation
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[data-link]');
    if (anchor) {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      if (href && href !== location.pathname) {
        navigate(href);
      }
    }
  });

  // Initial resolve
  resolve();
}
