<!doctype html>
<html lang="en">
<head>
<title>Family Tree</title>
<link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Noto+Sans+Devanagari:wght@400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{{ asset('lib/bootstrap-5.3.3.min.css') }}">
<link rel="stylesheet" href="{{ asset('css/base.css') }}">
<link rel="stylesheet" href="{{ asset('css/editor.css') }}">
</head>
<body>
<section class="screen" id="scr-editor" aria-label="Tree (read only)">
  <header class="etop">
    <div class="etitle">
      <button class="ibtn" id="eBack" aria-label="Family Tree home" title="Family Tree home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
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

<div class="toasts" id="toasts" aria-live="polite"></div>

<!-- ============ MODALS (view-only: no add/rename/confirm/share) ============ -->
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

<script>window.SHARED_TOKEN = @json($token);</script>
<script src="{{ asset('lib/jquery-3.7.1.min.js') }}"></script>
<script src="{{ asset('lib/bootstrap-5.3.3.bundle.min.js') }}"></script>
<script src="{{ asset('js/core.js') }}"></script>
<script src="{{ asset('js/api.js') }}"></script>
<script src="{{ asset('js/editor.js') }}"></script>
</body>
</html>
