@extends('templates/wrapper', ['css' => ['body' => 'bg-neutral-50']])

@section('title', ($title ?? config('app.name')) . ' | ' . config('app.name'))

@section('meta')
    @include('templates.vitrine.partials.head', ['seo' => $seo ?? []])
@endsection

{{-- These pages are plain server-rendered content, not part of the React SPA
     (no #app div is rendered): loading main.js would make it try to mount
     onto a div that does not exist and crash. --}}
@section('scripts')
@endsection

@section('container')
<div class="legal-page">
    <div class="wrap">
        @include('templates.vitrine.ssr.nav')

        <main>
            <a href="/" class="back">&larr; Retour à l'accueil</a>
            <h1>{{ $title }}</h1>
            @if(!empty($updated))
                <p class="updated">Dernière mise à jour : {{ $updated }}</p>
            @endif

            @yield('legal-content')
        </main>

        @include('templates.vitrine.ssr.footer')
    </div>
</div>
@endsection
