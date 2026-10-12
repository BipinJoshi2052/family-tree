<!doctype html>
<html lang="en">
<head>
<title>{{ $tree->name }} · Family Tree</title>
<link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Noto+Sans+Devanagari:wght@400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{{ asset('lib/bootstrap-5.3.3.min.css') }}">
<link rel="stylesheet" href="{{ asset('css/base.css') }}">
<link rel="stylesheet" href="{{ asset('css/editor.css') }}">
</head>
<body>
<section class="screen" id="scr-editor" aria-label="Tree editor">
  <header class="etop">
    <div class="etitle">
      <button class="ibtn" id="eBack" aria-label="Back to my trees" title="Back to my trees"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <div style="min-width:0"><div class="nm" id="eName">{{ $tree->name }}</div><small id="eMeta"></small></div>
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
  </main>
</section>

<div class="toasts" id="toasts" aria-live="polite"></div>
<input type="file" id="dPhoto" accept="image/*" hidden>

<!-- ============ MODALS ============ -->
<!-- Rename/Confirm modals: identical copy also lives in trees.blade.php. Keep both in sync. -->
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
        <div>
          <label class="form-label" for="fImg">Avatar image URL</label>
          <div class="av-row"><div class="av-prev" id="avPrev"></div>
            <div class="flex-grow-1" style="min-width:0"><input class="form-control" id="fImg" type="url" placeholder="https://…/photo.jpg">
              <div class="d-flex align-items-center gap-2 mt-2"><label class="btn btn-quiet btn-sm mb-0" for="fFile">Upload photo</label><input type="file" id="fFile" accept="image/*" hidden><span class="form-text m-0" id="imgNote">Optional</span></div></div></div>
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

<script>window.TREE = @json(['id' => $tree->id, 'name' => $tree->name, 'default_lang' => $tree->default_lang]);</script>
<script src="{{ asset('lib/jquery-3.7.1.min.js') }}"></script>
<script src="{{ asset('lib/bootstrap-5.3.3.bundle.min.js') }}"></script>
<script src="{{ asset('js/core.js') }}"></script>
<script src="{{ asset('js/api.js') }}"></script>
<script src="{{ asset('js/actions.js') }}"></script>
<script src="{{ asset('js/editor.js') }}"></script>
</body>
</html>
