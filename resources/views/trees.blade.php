<!doctype html>
<html lang="en">
<head>
<title>Family Tree</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Noto+Sans+Devanagari:wght@400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{{ asset('lib/bootstrap-5.3.3.min.css') }}">
<link rel="stylesheet" href="{{ asset('css/base.css') }}">
<link rel="stylesheet" href="{{ asset('css/trees.css') }}">
</head>
<body>
<section class="screen" id="scr-app" aria-label="Family Tree">
  <nav class="side" aria-label="Main">
    <div class="brand"><svg viewBox="0 0 32 32"><rect x="2" y="3" width="12" height="9" rx="2.5" fill="#039be5"/><rect x="18" y="3" width="12" height="9" rx="2.5" fill="#fb8c00"/><path d="M8 12v4h16v-4M16 16v5" stroke="#9aa3ad" stroke-width="1.6" fill="none"/><rect x="10" y="21" width="12" height="9" rx="2.5" fill="#039be5"/></svg><b class="wordmark">Family Tree</b></div>
    <button class="btn btn-go d-flex align-items-center justify-content-center gap-2" data-action="new-tree"><svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>New tree</button>
    <div class="nav-list" id="sideNav"></div>
  </nav>
  <div class="main">
    <header class="apphead">
      <div class="mbrand"><svg viewBox="0 0 32 32"><rect x="2" y="3" width="12" height="9" rx="2.5" fill="#039be5"/><rect x="18" y="3" width="12" height="9" rx="2.5" fill="#fb8c00"/><path d="M8 12v4h16v-4M16 16v5" stroke="#9aa3ad" stroke-width="1.6" fill="none"/><rect x="10" y="21" width="12" height="9" rx="2.5" fill="#039be5"/></svg><b class="wordmark">Family Tree</b></div>
      <h2 id="viewTitle">My trees</h2>
      <div class="hsearch d-none d-md-block"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="treeSearch" type="search" placeholder="Search your trees" aria-label="Search trees"></div>
      <div class="dropdown">
        <button class="ibtn" data-bs-toggle="dropdown" aria-label="Account" style="width:auto;padding:0 2px"><span class="uav" id="meAv">U</span></button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li class="px-2 py-1"><b id="meName" class="d-block"></b><small class="muted" id="meEmail"></small></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item" data-nav="settings">${I.gear}Settings</button></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item" type="submit" form="logoutForm">${I.out}Sign out</button></li>
        </ul>
      </div>
    </header>
    <div class="content" id="content">
      <!-- My trees -->
      <section class="view on" id="v-trees">
        <h2 class="page-title">My trees</h2>
        <div class="hsearch d-md-none mb-3" style="width:100%"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="treeSearchM" type="search" placeholder="Search your trees" aria-label="Search trees"></div>
        <div class="toolbar">
          <div class="chips" id="treeFilter"><button class="chip-btn on" data-f="all">All</button><button class="chip-btn" data-f="starred">Starred</button></div>
          <select class="form-select" id="treeSort" aria-label="Sort trees"><option value="recent">Last edited</option><option value="name">Name A–Z</option><option value="size">Most people</option></select>
          <button class="btn btn-quiet btn-sm" data-action="import">Import JSON file</button>
        </div>
        <div class="grid" id="treeGrid"></div>
      </section>
      <!-- Settings -->
      <section class="view" id="v-settings">
        <h2 class="page-title">Settings</h2>
        <div class="set-card">
          <h3>Profile</h3><p class="sub">Your name and email for this account.</p>
          <form id="profileForm" class="d-grid gap-3" novalidate>
            <div class="d-flex align-items-center gap-3"><span class="uav lg" id="profAv">U</span><div class="d-flex gap-2 flex-wrap" id="avColors"></div></div>
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label" for="pfName">Name</label><input class="form-control" id="pfName" required maxlength="60"></div>
              <div class="col-md-6 ne-only"><label class="form-label" for="pfNameNe">Nepali name · नेपाली नाम</label><input class="form-control" id="pfNameNe" lang="ne" maxlength="60" placeholder="वैकल्पिक"></div>
              <div class="col-md-6"><label class="form-label" for="pfEmail">Email</label><input class="form-control" type="email" id="pfEmail" required></div>
            </div>
            <div><button class="btn btn-go" type="submit">Save profile</button></div>
          </form>
        </div>
        <div class="set-card">
          <h3>Languages</h3><p class="sub">Choose the languages you use for people's names. Every tree can then be shown in any language you turn on.</p>
          <div class="lang-row"><span class="lang-badge">EN</span><div class="lbl"><b>English</b><small>Always on. Every person has an English name.</small></div><div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" id="langEn" checked disabled aria-label="English (always on)"></div></div>
          <div class="lang-row"><span class="lang-badge" lang="ne">ने</span><div class="lbl"><b>नेपाली <span class="muted">· Nepali</span></b><small>Adds a Nepali name field when you add people, and a language switch on every tree.</small></div><div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" id="langNe" aria-label="Nepali"></div></div>
        </div>
        <div class="set-card">
          <h3>Account</h3><p class="sub" id="provTxt">&nbsp;</p>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-quiet" type="submit" form="logoutForm">Sign out</button>
          </div>
        </div>
      </section>
    </div>
    <nav class="tabbar" id="tabbar" aria-label="Main"></nav>
  </div>
  <button class="fab" data-action="new-tree" aria-label="New tree"><svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
</section>

<form id="logoutForm" method="POST" action="{{ route('logout') }}" hidden>@csrf</form>
<div class="toasts" id="toasts" aria-live="polite"></div>
<input type="file" id="importFiles" accept=".json,application/json" hidden>

<!-- ============ MODALS ============ -->
<div class="modal fade" id="newTreeModal" tabindex="-1" aria-labelledby="ntTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <form class="modal-content" id="newTreeForm" novalidate>
      <div class="modal-header"><h5 class="modal-title" id="ntTitle">New family tree</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body d-grid gap-3">
        <div><label class="form-label" for="ntName">Tree name</label><input class="form-control" id="ntName" required maxlength="60" placeholder="e.g. Dad's side"><div class="invalid-feedback">Give the tree a name you'll recognise.</div></div>
        <div>
          <span class="form-label d-block">Start from</span>
          <div class="d-grid gap-2" id="ntStart">
            <label class="acct"><input class="form-check-input m-0" type="radio" name="ntFrom" value="me" checked><span><b>Just me</b><small>One card with your name. Add relatives from there.</small></span></label>
            <label class="acct"><input class="form-check-input m-0" type="radio" name="ntFrom" value="person"><span><b>Someone else</b><small>Start from a grandparent or any ancestor.</small></span></label>
          </div>
        </div>
        <div id="ntPersonWrap" hidden class="row g-3">
          <div class="col-8"><label class="form-label" for="ntPerson">Their full name</label><input class="form-control" id="ntPerson" maxlength="80" placeholder="e.g. Harold Whitmore"><div class="invalid-feedback">Enter a name for the first card.</div></div>
          <div class="col-4"><label class="form-label" for="ntGender">Gender</label><select class="form-select" id="ntGender"><option value="male">Male</option><option value="female">Female</option></select></div>
        </div>
        <div id="ntPersonNeWrap" hidden class="ne-only"><label class="form-label" for="ntPersonNe">Their Nepali name · नेपाली नाम (optional)</label><input class="form-control" id="ntPersonNe" lang="ne" maxlength="80" placeholder="जस्तै: राम बहादुर श्रेष्ठ"></div>
        <div id="ntMeWrap" class="row g-3">
          <div class="col-12"><label class="form-label" for="ntMeGender">Your card colour</label><select class="form-select" id="ntMeGender"><option value="male">Blue (male)</option><option value="female">Orange (female)</option></select></div>
        </div>
        <div class="ne-only"><label class="form-label" for="ntLang">Show names in</label><select class="form-select" id="ntLang"><option value="en">English</option><option value="ne">नेपाली (Nepali)</option></select><div class="form-text">The tree opens in this language. You can switch any time.</div></div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-go">Create tree</button></div>
    </form>
  </div>
</div>

<!-- Rename/Confirm modals: identical copy also lives in editor.blade.php. Keep both in sync. -->
<div class="modal fade" id="renameModal" tabindex="-1" aria-labelledby="rnTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <form class="modal-content" id="renameForm" novalidate>
      <div class="modal-header"><h5 class="modal-title" id="rnTitle">Rename tree</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body"><label class="form-label" for="rnName">Name</label><input class="form-control" id="rnName" required maxlength="60"><div class="invalid-feedback">A tree needs a name.</div></div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-go">Rename</button></div>
    </form>
  </div>
</div>

<div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="cfTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header"><h5 class="modal-title" id="cfTitle">Delete tree?</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body" id="cfBody"></div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn btn-danger-solid" id="cfGo">Delete</button></div>
    </div>
  </div>
</div>

<script src="{{ asset('lib/jquery-3.7.1.min.js') }}"></script>
<script src="{{ asset('lib/bootstrap-5.3.3.bundle.min.js') }}"></script>
<script src="{{ asset('js/core.js') }}"></script>
<script src="{{ asset('js/api.js') }}"></script>
<script src="{{ asset('js/actions.js') }}"></script>
<script src="{{ asset('js/trees.js') }}"></script>
</body>
</html>
