<!doctype html>
<html lang="en">
<head>
<title>Family Tree</title>
<link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Noto+Sans+Devanagari:wght@400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{{ asset('lib/bootstrap-5.3.3.min.css') }}">
<link rel="stylesheet" href="{{ asset('css/base.css') }}">
<link rel="stylesheet" href="{{ asset('css/trees.css') }}">
<link rel="stylesheet" href="{{ asset('css/editor.css') }}">
</head>
<body>
<!-- ============ APP SCREEN: My trees / Settings ============ -->
<section class="screen app-screen" id="scr-app" aria-label="Family Tree">
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
        <div class="content-loader" id="contentLoader" hidden><span class="spinner"></span></div>
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

<!-- ============ EDITOR SCREEN ============ -->
<section class="screen app-screen" id="scr-editor" aria-label="Tree editor">
  <header class="etop">
    <div class="etitle">
      <button class="ibtn" id="eBack" aria-label="Back to my trees" title="Back to my trees"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <div style="min-width:0"><div class="nm" id="eName"></div><small id="eMeta"></small></div>
    </div>
    <div class="search-wrap">
      <svg class="s-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="search" type="search" placeholder="Search... type name to locate" autocomplete="off" aria-label="Search people">
      <div id="results" class="results" hidden></div>
    </div>
    <div class="tools">
      <div class="dropdown lang-dd" id="eLangWrap" hidden>
        <button class="tbtn" data-bs-toggle="dropdown" aria-label="Name language" id="eLangBtn"></button>
        <ul class="dropdown-menu dropdown-menu-end" id="eLangMenu" style="min-width:250px"></ul>
      </div>
      <button class="tbtn" id="zout" aria-label="Zoom out"><svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg></button>
      <span class="zread" id="zread">100%</span>
      <button class="tbtn" id="zin" aria-label="Zoom in"><svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg></button>
      <button class="tbtn" id="reset" title="Fit the whole tree"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span class="lbl-txt">Reset</span></button>
      <div class="dropdown">
        <button class="tbtn" data-bs-toggle="dropdown" aria-label="More"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
        <ul class="dropdown-menu dropdown-menu-end" id="eMenu"></ul>
      </div>
    </div>
  </header>
  <main class="viewport" id="viewport">
    <div id="world">
      <svg class="layer" id="links" xmlns="http://www.w3.org/2000/svg"></svg>
      <div id="nodes"></div>
      <svg class="layer" id="glinks" xmlns="http://www.w3.org/2000/svg" style="z-index:3"></svg>
      <div id="ghosts"></div>
    </div>
    <div class="status" id="status"></div>
    <div class="content-loader" id="editorLoader" hidden><span class="spinner"></span></div>
  </main>
</section>

<form id="logoutForm" method="POST" action="{{ route('logout') }}" hidden>@csrf</form>
<div class="toasts" id="toasts" aria-live="polite"></div>
<input type="file" id="importFiles" accept=".json,application/json" hidden>
<input type="file" id="dPhoto" accept="image/*" class="visually-hidden">

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

<!-- Rename/Confirm modals: shared between the app and editor screens -->
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

<div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="addTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <form class="modal-content" id="addForm" novalidate>
      <div class="modal-header gap-3"><span class="rel-chip" id="addChip"></span><h5 class="modal-title me-auto" id="addTitle">Add relative</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body d-grid gap-3">
        <div id="coWrap"><label class="form-label" for="fCo" id="coLabel">Select Mother</label><select class="form-select" id="fCo"></select><div class="form-text" id="coHelp"></div></div>
        <div><label class="form-label" for="fName" id="fNameLbl">Full name</label><input class="form-control" id="fName" required maxlength="80"><div class="invalid-feedback">Enter a name so the card has a label.</div>
        </div>
        <div class="ne-only" id="fNeWrap"><label class="form-label" for="fNameNe">Nepali name · नेपाली नाम <span class="text-lowercase">(optional)</span></label><input class="form-control" id="fNameNe" lang="ne" maxlength="80" placeholder="जस्तै: राम बहादुर श्रेष्ठ"><div class="form-text">Leave it empty and the English name shows when the tree is in Nepali.</div></div>
        <div class="row g-3">
          <div class="col-sm-6"><label class="form-label" for="fBirth">Birth date</label><input class="form-control" type="date" id="fBirth"></div>
          <div class="col-sm-6"><label class="form-label" for="fPlace">Birthplace</label><input class="form-control" id="fPlace" maxlength="80" placeholder="Town, country"></div>
        </div>
        <div><span class="form-label d-block">Status</span><div class="seg" role="radiogroup" aria-label="Status"><input type="radio" name="fStatus" id="stLive" value="living" checked><label for="stLive">Living</label><input type="radio" name="fStatus" id="stDead" value="deceased"><label for="stDead">Deceased</label></div></div>
        <div id="deathWrap" hidden><label class="form-label" for="fDeath">Date of passing</label><input class="form-control" type="date" id="fDeath"></div>
        <div><span class="form-label d-block">Residency</span><div class="seg" role="radiogroup" aria-label="Residency"><input type="radio" name="fResidency" id="fLocal" value="local" checked><label for="fLocal">In country</label><input type="radio" name="fResidency" id="fAbroad" value="abroad"><label for="fAbroad">Abroad</label></div></div>
        <div>
          <label class="form-label" for="fImg">Avatar image URL</label>
          <div class="av-row"><div class="av-prev" id="avPrev"></div>
            <div class="flex-grow-1" style="min-width:0"><input class="form-control" id="fImg" type="url" placeholder="https://…/photo.jpg">
              <div class="d-flex align-items-center gap-2 mt-2"><label class="btn btn-quiet btn-sm mb-0" for="fFile">Upload photo</label><input type="file" id="fFile" accept="image/*" class="visually-hidden"><span class="form-text m-0" id="imgNote">Optional</span></div></div></div>
        </div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-go" id="addSubmit">Add</button></div>
    </form>
  </div>
</div>

<div class="modal fade" id="detModal" tabindex="-1" aria-labelledby="detName" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header"><span class="muted small" id="detGen"></span><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body" id="detBody"></div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Close</button><button type="button" class="btn btn-go" id="detLocate">Show in tree</button></div>
    </div>
  </div>
</div>

<div class="modal fade" id="summaryModal" tabindex="-1" aria-labelledby="sumTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header"><h5 class="modal-title" id="sumTitle">Tree summary</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body"><div class="sum-grid" id="sumGrid"></div></div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Close</button></div>
    </div>
  </div>
</div>

<div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="flTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <form class="modal-content" id="filterForm">
      <div class="modal-header"><h5 class="modal-title" id="flTitle">Filter</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body d-grid gap-2">
        <label class="acct"><input class="form-check-input m-0" type="radio" name="flMode" value="all" checked><span><b>All</b><small>Everyone in the tree, including spouses who married in.</small></span></label>
        <label class="acct"><input class="form-check-input m-0" type="radio" name="flMode" value="blood"><span><b>Blood members</b><small>Hides spouses - only people related by descent are shown.</small></span></label>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-go">Save</button></div>
    </form>
  </div>
</div>

<div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header"><h5 class="modal-title" id="shTitle">Share this tree</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body">
        <p class="muted">Anyone with this link can view the tree and everyone's details - they can't add, remove, or change anything.</p>
        <div class="input-group">
          <input type="text" class="form-control" id="shLink" readonly>
          <button class="btn btn-quiet" type="button" id="shCopy">Copy</button>
        </div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" style="color:#ff8a80" id="shStop">Stop sharing</button><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Close</button></div>
    </div>
  </div>
</div>

<div class="modal fade" id="branchModal" tabindex="-1" aria-labelledby="brTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <form class="modal-content" id="branchForm" novalidate>
      <div class="modal-header"><h5 class="modal-title" id="brTitle">Branch into a new tree</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body">
        <p class="muted" id="brDesc"></p>
        <label class="form-label" for="brName">New tree name</label><input class="form-control" id="brName" required maxlength="60">
        <div class="invalid-feedback">Give the new tree a name.</div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-quiet" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-go">Create</button></div>
    </form>
  </div>
</div>

<script>
window.INITIAL_VIEW = @json($initialView);
window.INITIAL_TREE_SLUG = @json($treeSlug);
window.INITIAL_FRESH = @json($fresh);
</script>
<script src="{{ asset('lib/jquery-3.7.1.min.js') }}"></script>
<script src="{{ asset('lib/bootstrap-5.3.3.bundle.min.js') }}"></script>
<script src="{{ asset('js/core.js') }}"></script>
<script src="{{ asset('js/api.js') }}"></script>
<script src="{{ asset('js/actions.js') }}"></script>
<script src="{{ asset('js/trees.js') }}"></script>
<script src="{{ asset('js/editor.js') }}"></script>
</body>
</html>
