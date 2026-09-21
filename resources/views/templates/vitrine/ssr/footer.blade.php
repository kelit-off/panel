<footer>
    <nav aria-label="Jeux">
        @foreach($games as $game)
            <a href="/jeu/{{ $game['slug'] }}">Serveur {{ $game['name'] }}</a>
        @endforeach
    </nav>
    <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
</footer>
