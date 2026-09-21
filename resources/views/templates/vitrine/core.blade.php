@extends('templates/wrapper', [
    'css' => ['body' => 'bg-neutral-800'],
])

@section('title', $seo['title'] ?? config('app.name', 'Pterodactyl'))

@section('meta')
    @include('templates.vitrine.partials.head', ['seo' => $seo ?? []])
@endsection

@section('container')
    <div id="app">
        @isset($ssr)
            @include($ssr, $ssrData ?? [])
        @endisset
    </div>
@endsection
