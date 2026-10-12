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
<link rel="stylesheet" href="{{ asset('css/login.css') }}">
</head>
<body>
@php $tab = old('form', request('tab') === 'signup' ? 'signup' : 'login'); @endphp
<section class="screen" id="scr-auth" aria-label="Sign in">
  <aside class="auth-art">
    <span class="wordmark" style="font-size:1.1rem;display:flex;align-items:center;gap:10px"><svg width="28" height="28" viewBox="0 0 32 32"><rect x="2" y="3" width="12" height="9" rx="2.5" fill="#039be5"/><rect x="18" y="3" width="12" height="9" rx="2.5" fill="#fb8c00"/><path d="M8 12v4h16v-4M16 16v5" stroke="#9aa3ad" stroke-width="1.6" fill="none"/><rect x="10" y="21" width="12" height="9" rx="2.5" fill="#039be5"/></svg>Family Tree</span>
    <svg class="art-tree" viewBox="0 0 520 360" aria-hidden="true">
      <path d="M200 70v30h120V70M260 100v40M120 140h300M120 140v30M260 140v30M400 140v30M120 230v26h-60v24M120 256h60v24M400 230v50" stroke="#3a4048" stroke-width="2" fill="none"/>
      <rect x="140" y="20" width="120" height="50" rx="9" fill="#039be5"/><rect x="280" y="20" width="120" height="50" rx="9" fill="#fb8c00"/>
      <rect x="60" y="170" width="120" height="60" rx="9" fill="#039be5"/><rect x="200" y="170" width="120" height="60" rx="9" fill="#fb8c00"/><rect x="340" y="170" width="120" height="60" rx="9" fill="#039be5"/>
      <rect x="0" y="280" width="120" height="50" rx="9" fill="#fb8c00" opacity=".85"/><rect x="120" y="280" width="120" height="50" rx="9" fill="none" stroke="#9aa3ad" stroke-width="2" stroke-dasharray="7 6"/><rect x="340" y="280" width="120" height="50" rx="9" fill="#039be5" opacity=".85"/>
    </svg>
    <figure style="margin:0;position:relative">
      <blockquote>&ldquo;I finally know which great-grandmother was which.&rdquo;</blockquote>
      <figcaption>Sample note from the Whitmore family tree</figcaption>
    </figure>
  </aside>
  <div class="auth-main">
    <div class="auth-card">
      <div>
        <h1 id="authTitle">{{ $tab === 'signup' ? 'Create your account' : 'Welcome back' }}</h1>
        <p class="muted mb-0" id="authSub">{{ $tab === 'signup' ? 'Free to use. No card needed.' : 'Log in to open your family trees.' }}</p>
      </div>
      <div class="auth-tabs" role="tablist">
        <button type="button" class="{{ $tab === 'login' ? 'on' : '' }}" data-auth="login" role="tab" aria-selected="{{ $tab === 'login' ? 'true' : 'false' }}">Log in</button>
        <button type="button" class="{{ $tab === 'signup' ? 'on' : '' }}" data-auth="signup" role="tab" aria-selected="{{ $tab === 'signup' ? 'true' : 'false' }}">Sign up</button>
      </div>

      <form id="loginForm" class="d-grid gap-3" novalidate method="POST" action="{{ route('login.attempt') }}" @if($tab !== 'login') hidden @endif>
        @csrf
        <input type="hidden" name="form" value="login">
        <div>
          <label class="form-label" for="liEmail">Email</label>
          <input class="form-control @error('email') is-invalid @enderror" type="email" name="email" id="liEmail" required autocomplete="username" placeholder="you@example.com" value="{{ old('email') }}">
          <div class="invalid-feedback">{{ $errors->first('email') ?: 'Enter an email address like name@example.com.' }}</div>
        </div>
        <div>
          <label class="form-label" for="liPw">Password</label>
          <div class="pw-wrap"><input class="form-control" type="password" name="password" id="liPw" required autocomplete="current-password" placeholder="Your password"><button type="button" class="pw-eye" data-eye="liPw" aria-label="Show password"></button><div class="invalid-feedback">Enter your password.</div></div>
        </div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="remember" id="liRemember" checked><label class="form-check-label" for="liRemember">Keep me signed in</label></div>
        <button type="submit" class="btn btn-go w-100" id="liSubmit">Log in</button>
      </form>

      <form id="signupForm" class="d-grid gap-3" novalidate method="POST" action="{{ route('register') }}" @if($tab !== 'signup') hidden @endif>
        @csrf
        <input type="hidden" name="form" value="signup">
        <div>
          <label class="form-label" for="suName">Full name</label>
          <input class="form-control @error('name') is-invalid @enderror" name="name" id="suName" required maxlength="60" autocomplete="name" placeholder="e.g. Michael Whitmore" value="{{ old('name') }}">
          <div class="invalid-feedback">{{ $errors->first('name') ?: 'Enter your name.' }}</div>
        </div>
        <div>
          <label class="form-label" for="suEmail">Email</label>
          <input class="form-control @error('email') is-invalid @enderror" type="email" name="email" id="suEmail" required autocomplete="email" placeholder="you@example.com" value="{{ old('email') }}">
          <div class="invalid-feedback">{{ $errors->first('email') ?: 'Enter an email address like name@example.com.' }}</div>
        </div>
        <div>
          <label class="form-label" for="suPw">Password</label>
          <div class="pw-wrap"><input class="form-control @error('password') is-invalid @enderror" type="password" name="password" id="suPw" required minlength="8" autocomplete="new-password" placeholder="At least 8 characters"><button type="button" class="pw-eye" data-eye="suPw" aria-label="Show password"></button><div class="invalid-feedback">{{ $errors->first('password') ?: 'Use at least 8 characters.' }}</div></div>
          <div class="strength" id="pwStrength"><i></i><i></i><i></i><i></i></div>
          <div class="form-text" id="pwHint">Mix letters, numbers and a symbol for a stronger password.</div>
        </div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="suTerms" required><label class="form-check-label" for="suTerms">I agree to the Terms and Privacy Policy</label><div class="invalid-feedback">Tick the box to create your account.</div></div>
        <button type="submit" class="btn btn-go w-100" id="suSubmit">Create account</button>
      </form>
    </div>
  </div>
</section>

<div class="toasts" id="toasts" aria-live="polite"></div>
<script src="{{ asset('lib/jquery-3.7.1.min.js') }}"></script>
<script src="{{ asset('lib/bootstrap-5.3.3.bundle.min.js') }}"></script>
<script src="{{ asset('js/core.js') }}"></script>
<script src="{{ asset('js/login.js') }}"></script>
</body>
</html>
