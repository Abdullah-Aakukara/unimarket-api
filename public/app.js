/* ============================================================
   UNIMARKET — FRONTEND JAVASCRIPT
   Uses relative URLs for API calls, so they work locally and on Render.
   ============================================================ */

const API_BASE = '';

// ── App State ────────────────────────────────────────────
const app = {
    token: localStorage.getItem('um_token') || null,
    user:  JSON.parse(localStorage.getItem('um_user') || 'null'),
    currentPage: 'home',
    products: [],
    activeCategory: '',
    // First fetch of a key → DB (cache miss). Any repeat → Redis (cache hit).
    fetchedKeys: new Set(),
};

// ── Category helpers ─────────────────────────────────────
const CATEGORIES = {
    '1': '📚 Books',
    '2': '💻 Electronics',
    '3': '✏️ Stationary',
    '4': '👕 Clothing',
    '5': '🎮 Others',
};

const CONDITION_CLASS = {
    'new':      'cond-new',
    'like-new': 'cond-like-new',
    'good':     'cond-good',
    'fair':     'cond-fair',
    'poor':     'cond-poor',
};

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    syncAuthUI();
    showPage('home');

    // Scroll effect on navbar
    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 12);
    });
});

// ── Page routing ─────────────────────────────────────────
function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const page = document.getElementById(`page-${name}`);
    if (page) {
        page.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const navBtn = document.getElementById(`nav${name.charAt(0).toUpperCase() + name.slice(1)}`);
    if (navBtn) navBtn.classList.add('active');

    app.currentPage = name;

    // Side effects
    if (name === 'browse') loadProducts(app.activeCategory);
    if (name === 'sell' && app.user) {
        document.getElementById('sellerName').textContent = app.user.username;
    }
}

function requireAuth(page) {
    if (!app.token) {
        showToast('Please sign in to list items.', 'info');
        showPage('login');
        return;
    }
    showPage(page);
}

// ── Auth UI sync ─────────────────────────────────────────
function syncAuthUI() {
    const userPill  = document.getElementById('userPill');
    const authBtns  = document.getElementById('authBtns');
    const userAvatar = document.getElementById('userAvatar');
    const userName  = document.getElementById('userName');

    if (app.token && app.user) {
        userPill.style.display  = 'flex';
        authBtns.style.display  = 'none';
        userAvatar.textContent  = app.user.username[0].toUpperCase();
        userName.textContent    = app.user.username;
    } else {
        userPill.style.display  = 'none';
        authBtns.style.display  = 'flex';
    }
}

function handleLogout() {
    app.token = null;
    app.user  = null;
    localStorage.removeItem('um_token');
    localStorage.removeItem('um_user');
    syncAuthUI();
    showToast('You have been signed out.', 'info');
    showPage('home');
}

// ── Register ─────────────────────────────────────────────
async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    const res = document.getElementById('registerResponse');

    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    setBtnLoading(btn, true, 'Creating account…');
    hideEl(res);

    try {
        const response = await apiFetch('/api/auth/register', 'POST', { username, email, password });

        showFormResponse(res, `✓ ${response.message}`, 'success');
        showToast(`Welcome, ${username}! Now sign in.`, 'success');
        document.getElementById('registerForm').reset();
        setTimeout(() => {
            showPage('login');
            document.getElementById('loginEmail').value = email;
        }, 1400);

    } catch (err) {
        showFormResponse(res, `✗ ${err.message}`, 'error');
        showToast(err.message, 'error');
    } finally {
        setBtnLoading(btn, false, 'Create Account');
    }
}

// ── Login ─────────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const res = document.getElementById('loginResponse');

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    setBtnLoading(btn, true, 'Signing in…');
    hideEl(res);

    try {
        const response = await apiFetch('/api/auth/login', 'POST', { email, password });

        // Decode JWT payload to get username
        const payload = parseJwt(response.token);
        app.token = response.token;
        app.user  = { username: payload.username, id: payload.id, email: payload.email };

        localStorage.setItem('um_token', app.token);
        localStorage.setItem('um_user', JSON.stringify(app.user));
        syncAuthUI();

        showToast(response.message, 'success');
        document.getElementById('loginForm').reset();
        showPage('browse');

    } catch (err) {
        showFormResponse(res, `✗ ${err.message}`, 'error');
        showToast(err.message, 'error');
    } finally {
        setBtnLoading(btn, false, 'Sign In');
    }
}

// ── Browse / Load products ────────────────────────────────
async function loadProducts(categoryId = '') {
    app.activeCategory = categoryId;

    showEl('productsLoading');
    hideEl('productsGrid');
    hideEl('productsEmpty');
    hideEl('cacheIndicator');

    // Build the cache key the same way the backend does
    const cacheKey = categoryId ? `products:categoryId:${categoryId}` : `products:all`;
    // Is this the first time we're fetching this key this session?
    const isFirstFetch = !app.fetchedKeys.has(cacheKey);

    const t0 = performance.now();

    try {
        const url = categoryId
            ? `/api/products?category_id=${categoryId}`
            : `/api/products`;

        const data = await apiFetch(url, 'GET');
        const products = data['Today\'s Sale'] || data.products || [];
        app.products = products;

        const elapsed = Math.round(performance.now() - t0);

        // Mark this key as fetched for the rest of the session
        app.fetchedKeys.add(cacheKey);

        showCacheHint(elapsed, isFirstFetch);
        hideEl('productsLoading');

        if (products.length === 0) {
            showEl('productsEmpty');
            return;
        }

        renderProducts(products);
        showEl('productsGrid');

    } catch (err) {
        hideEl('productsLoading');
        showEl('productsEmpty');
        showToast('Failed to load products: ' + err.message, 'error');
    }
}

// isFirstFetch = true  → first request this session → cache MISS → came from PostgreSQL
// isFirstFetch = false → repeated request          → cache HIT  → came from Redis
function showCacheHint(ms, isFirstFetch) {
    const indicator = document.getElementById('cacheIndicator');
    const msg = document.getElementById('cacheMsg');

    if (isFirstFetch) {
        // Cache miss: backend queried PostgreSQL, then stored result in Redis
        msg.textContent = `🗄️ Fetched from PostgreSQL in ${ms}ms · Result cached in Redis for 60s`;
        indicator.style.cssText = 'display:inline-flex; border-color:rgba(59,130,246,0.35); color:#60a5fa;';
        indicator.querySelector('.cache-dot').style.background = '#60a5fa';
    } else {
        // Cache hit: backend returned data directly from Redis, no DB query
        msg.textContent = `⚡ Served from Redis cache in ${ms}ms · No DB query needed`;
        indicator.style.cssText = 'display:inline-flex; border-color:rgba(16,185,129,0.35); color:#34d399;';
        indicator.querySelector('.cache-dot').style.background = '#34d399';
    }
}

function filterProducts(btn, categoryId) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadProducts(categoryId);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach((product, i) => {
        const cat       = CATEGORIES[product.category_id] || '🏷️ Other';
        const condClass = CONDITION_CLASS[product.condition?.toLowerCase()] || 'cond-good';
        const condLabel = product.condition || 'Unknown';
        const imageUrl  = product.image_url
            ? `${API_BASE}/${product.image_url}`
            : null;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${i * 50}ms`;
        card.onclick = () => openProductModal(product);

        card.innerHTML = `
            <div class="product-img-wrap">
                ${imageUrl
                    ? `<img class="product-img" src="${escHtml(imageUrl)}" alt="${escHtml(product.title)}" onerror="this.parentElement.innerHTML='<div class=product-no-img>${getEmoji(product.category_id)}</div>'">`
                    : `<div class="product-no-img">${getEmoji(product.category_id)}</div>`
                }
            </div>
            <div class="product-body">
                <div class="product-meta">
                    <span class="condition-badge ${condClass}">${escHtml(condLabel)}</span>
                    <span class="category-tag">${cat}</span>
                </div>
                <div class="product-title">${escHtml(product.title)}</div>
                <div class="product-desc">${escHtml(product.description || 'No description provided.')}</div>
                <div class="product-footer">
                    <span class="product-price">$${Number(product.price).toLocaleString()}</span>
                    <span class="product-seller">
                        <span class="seller-avatar">${(product.seller || '?')[0].toUpperCase()}</span>
                        ${escHtml(product.seller || 'Anonymous')}
                    </span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function getEmoji(catId) {
    const map = {'1':'📚','2':'💻','3':'✏️','4':'👕','5':'🎮'};
    return map[String(catId)] || '🏷️';
}

// ── Product Modal ─────────────────────────────────────────
function openProductModal(product) {
    const cat       = CATEGORIES[product.category_id] || 'Other';
    const condClass = CONDITION_CLASS[product.condition?.toLowerCase()] || 'cond-good';
    const imageUrl  = product.image_url ? `${API_BASE}/${product.image_url}` : null;

    document.getElementById('modalImg').src     = imageUrl || '';
    document.getElementById('modalImg').alt     = product.title;
    document.getElementById('modalTitle').textContent   = product.title;
    document.getElementById('modalPrice').textContent   = `$${Number(product.price).toLocaleString()}`;
    document.getElementById('modalDesc').textContent    = product.description || 'No description provided.';
    document.getElementById('modalSeller').textContent  = product.seller || 'Anonymous';
    document.getElementById('modalCondition').textContent = product.condition || '—';
    document.getElementById('modalCondition').className  = `condition-badge ${condClass}`;
    document.getElementById('modalCategory').textContent = cat;

    // Handle no image — show emoji fallback
    if (!imageUrl) {
        const wrap = document.getElementById('modalImg').parentElement;
        wrap.innerHTML = `<div class="product-no-img" style="height:280px;font-size:70px;">${getEmoji(product.category_id)}</div>`;
    }

    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}

function closeModal(e) {
    if (e.target === document.getElementById('productModal')) closeProductModal();
}

// ── Sell / Create Product ─────────────────────────────────
async function handleCreateProduct(e) {
    e.preventDefault();

    if (!app.token) { showToast('Please sign in first.', 'error'); return; }

    const btn   = document.getElementById('submitListingBtn');
    const title = document.getElementById('productTitle').value.trim();
    const price = document.getElementById('productPrice').value;
    const desc  = document.getElementById('productDesc').value.trim();
    const cat   = document.getElementById('productCategory').value;
    const cond  = document.getElementById('productCondition').value;
    const file  = document.getElementById('productImage').files[0];

    if (!file) { showToast('Please upload a product image.', 'error'); return; }

    setBtnLoading(btn, true, 'Publishing…');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', desc);
    formData.append('category_id', cat);
    formData.append('condition', cond);
    formData.append('productImage', file);

    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${app.token}` },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Error ${response.status}`);
        }

        showToast(data.message || 'Product listed successfully!', 'success');
        document.getElementById('sellFormCard').style.display  = 'none';
        document.getElementById('sellSuccess').style.display   = 'block';

    } catch (err) {
        if (err.message.includes('Too many')) {
            showToast('Rate limit hit: 5 products per hour max.', 'error');
        } else if (err.message.includes('401') || err.message.includes('403')) {
            showToast('Session expired. Please sign in again.', 'error');
            handleLogout();
        } else {
            showToast(err.message, 'error');
        }
    } finally {
        setBtnLoading(btn, false, 'Publish Listing');
    }
}

function resetSellForm() {
    document.getElementById('sellForm').reset();
    document.getElementById('imagePreview').style.display    = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('sellFormCard').style.display    = 'block';
    document.getElementById('sellSuccess').style.display     = 'none';
}

function previewImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const preview     = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const reader = new FileReader();
    reader.onload = ev => {
        preview.src = ev.target.result;
        preview.style.display    = 'block';
        placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// ── Utilities ─────────────────────────────────────────────
async function apiFetch(path, method = 'GET', body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (app.token) opts.headers['Authorization'] = `Bearer ${app.token}`;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
}

function parseJwt(token) {
    const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(atob(base64));
}

function escHtml(s) {
    return String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setBtnLoading(btn, loading, label) {
    btn.disabled = loading;
    if (label) btn.innerHTML = loading
        ? `<svg class="spin-inline" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="10" stroke-linecap="round"/></svg>${label}`
        : label;
}

function showFormResponse(el, text, type) {
    el.textContent  = text;
    el.className    = `form-response ${type}`;
    el.style.display = 'block';
}

function showEl(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.style.display = '';
}

function hideEl(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.style.display = 'none';
}

function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.style.opacity = isText ? '1' : '0.5';
}

function copyApiUrl() {
    const url = `${window.location.origin}/api/products`;
    navigator.clipboard.writeText(url).then(() => showToast('API URL copied!', 'success'));
}

// ── Toast notifications ───────────────────────────────────
function showToast(message, type = 'info') {
    const icons = {
        success: '✓',
        error:   '✗',
        info:    'ℹ',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${escHtml(message)}</span>`;
    document.getElementById('toastStack').appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
}

// Inline spinner for buttons
const spinStyle = document.createElement('style');
spinStyle.textContent = `
.spin-inline{animation:spin .7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg);}}
`;
document.head.appendChild(spinStyle);
