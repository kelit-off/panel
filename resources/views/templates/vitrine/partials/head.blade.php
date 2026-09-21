<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="robots" content="{{ $seo['robots'] ?? 'noindex,nofollow' }}">
@if(!empty($seo['description']))
    <meta name="description" content="{{ $seo['description'] }}">
@endif
@if(!empty($seo['canonical']))
    <link rel="canonical" href="{{ $seo['canonical'] }}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="{{ $seo['siteName'] ?? config('app.name') }}">
    <meta property="og:title" content="{{ $seo['title'] ?? '' }}">
    <meta property="og:description" content="{{ $seo['description'] ?? '' }}">
    <meta property="og:url" content="{{ $seo['canonical'] }}">
    <meta name="twitter:card" content="summary">
@endif
@if(!empty($seo['markdown']))
    <link rel="alternate" type="text/markdown" href="{{ $seo['markdown'] }}">
@endif
@if(!empty($seo['verification']['google']))
    <meta name="google-site-verification" content="{{ $seo['verification']['google'] }}">
@endif
@if(!empty($seo['verification']['bing']))
    <meta name="msvalidate.01" content="{{ $seo['verification']['bing'] }}">
@endif
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
<link rel="manifest" href="/favicons/manifest.json">
<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
<link rel="shortcut icon" href="/favicons/favicon.ico">
<meta name="msapplication-config" content="/favicons/browserconfig.xml">
<meta name="theme-color" content="#0e4688">
@if(!empty($seo['jsonLd']))
    <script type="application/ld+json">{!! json_encode($seo['jsonLd'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) !!}</script>
@endif
<script>
    // The server-rendered copy of the page is for crawlers and visitors without
    // JavaScript. With JavaScript, the app replaces it with the same content, so it
    // stays invisible meanwhile to avoid a flash of unstyled page. If the app has not
    // started after 10 seconds, it is shown rather than leaving a blank screen.
    document.documentElement.className += ' js';
    setTimeout(function () { document.documentElement.className = document.documentElement.className.replace(' js', ''); }, 10000);
</script>
<style>
    .js #app > .ssr { visibility: hidden; }
    #app > .ssr { min-height: 100vh; background: #f6f8fb; color: #111827; font-family: Manrope, system-ui, sans-serif; line-height: 1.6; }
    #app > .ssr .wrap { max-width: 72rem; margin: 0 auto; padding: 1.5rem; }
    #app > .ssr a { color: #1d4ed8; }
    #app > .ssr h1 { font-size: 2.25rem; line-height: 1.15; margin: 2rem 0 1rem; }
    #app > .ssr h2 { font-size: 1.4rem; margin: 2.5rem 0 1rem; }
    #app > .ssr header, #app > .ssr footer { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
    #app > .ssr nav a { margin-right: 1rem; }
    #app > .ssr .plans { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
    #app > .ssr .plan { background: #fff; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.25rem; }
    #app > .ssr .plan h2 { margin: 0 0 .25rem; font-size: 1.15rem; }
    #app > .ssr .price strong { font-size: 1.75rem; }
    #app > .ssr dl.specs { display: grid; grid-template-columns: 1fr auto; gap: .25rem 1rem; margin: 1rem 0; }
    #app > .ssr dl.specs dd { margin: 0; font-weight: 600; text-align: right; }
    #app > .ssr table { border-collapse: collapse; width: 100%; background: #fff; }
    #app > .ssr th, #app > .ssr td { border: 1px solid #e5e7eb; padding: .5rem .75rem; text-align: left; }
    #app > .ssr dt { font-weight: 700; margin-top: 1rem; }
    #app > .ssr dd { margin: .25rem 0 0; }
</style>
