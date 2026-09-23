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
<link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
<link rel="manifest" href="/favicons/manifest.json">
<link rel="shortcut icon" href="/favicons/favicon.ico">
<meta name="msapplication-config" content="/favicons/browserconfig.xml">
<meta name="msapplication-TileColor" content="#0b0f14">
<meta name="theme-color" content="#0b0f14">
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
    #app > .ssr, .legal-page { min-height: 100vh; background: #f6f8fb; color: #111827; font-family: Manrope, system-ui, sans-serif; line-height: 1.6; }
    #app > .ssr .wrap, .legal-page .wrap { max-width: 72rem; margin: 0 auto; padding: 1.5rem; }
    #app > .ssr a, .legal-page a { color: #0e9a62; }
    #app > .ssr h1, .legal-page h1 { font-size: 2.25rem; line-height: 1.15; margin: 2rem 0 1rem; }
    #app > .ssr h2, .legal-page h2 { font-size: 1.4rem; margin: 2.5rem 0 1rem; }
    #app > .ssr header, #app > .ssr footer, .legal-page header, .legal-page footer { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
    #app > .ssr nav a, .legal-page nav a { margin-right: 1rem; }
    #app > .ssr .plans { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
    #app > .ssr .plan { background: #fff; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.25rem; }
    #app > .ssr .plan h2 { margin: 0 0 .25rem; font-size: 1.15rem; }
    #app > .ssr .price strong { font-size: 1.75rem; }
    #app > .ssr dl.specs { display: grid; grid-template-columns: 1fr auto; gap: .25rem 1rem; margin: 1rem 0; }
    #app > .ssr dl.specs dd { margin: 0; font-weight: 600; text-align: right; }
    #app > .ssr table, .legal-page table { border-collapse: collapse; width: 100%; background: #fff; }
    #app > .ssr th, #app > .ssr td, .legal-page th, .legal-page td { border: 1px solid #e5e7eb; padding: .5rem .75rem; text-align: left; }
    #app > .ssr dt, .legal-page dt { font-weight: 700; margin-top: 1rem; }
    #app > .ssr dd, .legal-page dd { margin: .25rem 0 0; }
    .legal-page .back { display: inline-block; margin-bottom: 1rem; font-size: .875rem; font-weight: 600; }
    .legal-page .updated { color: #6b7280; font-size: .875rem; margin-top: -.5rem; }
    .legal-page section { margin-bottom: 2.5rem; }
    .legal-page ul, .legal-page ol { padding-left: 1.25rem; }
    .legal-page li { margin: .4rem 0; }
    .legal-page mark.placeholder { background: #fef3c7; color: #92400e; font-weight: 600; padding: .1rem .35rem; border-radius: .25rem; font-style: normal; }
    .legal-page .intro { color: #4b5563; max-width: 42rem; }
    .legal-page form.report label { display: block; font-weight: 600; margin: 1.25rem 0 .35rem; }
    .legal-page form.report input, .legal-page form.report select, .legal-page form.report textarea {
        width: 100%; max-width: 32rem; border: 1px solid #d1d5db; border-radius: .5rem; padding: .6rem .75rem; font: inherit;
    }
    .legal-page form.report textarea { max-width: 42rem; min-height: 8rem; }
    .legal-page form.report button {
        margin-top: 1.5rem; background: #0e9a62; color: #fff; border: 0; border-radius: 999px; height: 2.75rem; padding: 0 1.75rem; font-weight: 700; cursor: pointer;
    }
    .legal-page .flash-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 1rem 1.25rem; border-radius: .75rem; margin-bottom: 1.5rem; }
    .legal-page .flash-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 1rem 1.25rem; border-radius: .75rem; margin-bottom: 1.5rem; }
</style>
