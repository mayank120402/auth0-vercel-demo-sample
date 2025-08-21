(async () => {
  console.log('SDK type:', typeof createAuth0Client);
  if (typeof createAuth0Client !== 'function') {
    //alert('Auth0 SDK not loaded. Check script order in index.html.');
    //return;
     document.getElementById('profile').textContent = 'Error: Auth0 SDK failed to load.';
  return;
  }
  const cfg = await fetch('auth_config.json').then(r => r.json());
  const auth0 = await createAuth0Client({
    domain: cfg.domain,
    client_id: cfg.clientId,
    authorizationParams: { redirect_uri: window.location.origin, audience: cfg.audience }
  });
  console.log('Auth0 client initialized');
  const loginBtn = document.getElementById('login');
  const logoutBtn = document.getElementById('logout');
  const profileEl = document.getElementById('profile');
  const adminEl = document.getElementById('admin');
  loginBtn.onclick = () => auth0.loginWithRedirect();
  logoutBtn.onclick = () => auth0.logout({ returnTo: window.location.origin });
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, location.pathname);
  }
  const isAuthenticated = await auth0.isAuthenticated();
  loginBtn.style.display = isAuthenticated ? 'none' : 'inline-block';
  logoutBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
  if (isAuthenticated) {
    const user = await auth0.getUser();
    const claims = await auth0.getIdTokenClaims();
    const roles = claims['https://example.com/roles'] || [];
    profileEl.textContent = JSON.stringify({ user, roles }, null, 2);
    adminEl.style.display = roles.includes('admin') ? 'block' : 'none';
  } else {
    profileEl.textContent = 'Not logged in';
    adminEl.style.display = 'none';
  }
})();
