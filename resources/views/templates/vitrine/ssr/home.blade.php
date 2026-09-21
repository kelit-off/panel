<div class="ssr">
    <div class="wrap">
        @include('templates.vitrine.ssr.nav')

        <main>
            <h1>{{ $hero['title'] }}</h1>
            <p>{{ $hero['text'] }}</p>

            <section>
                <h2>À quel jeu voulez-vous jouer ?</h2>
                <ul>
                    @foreach($games as $game)
                        <li>
                            <a href="/jeu/{{ $game['slug'] }}">{{ $game['name'] }}</a>
                            @if($game['fromPrice'])
                                : dès {{ \Pterodactyl\Services\Storefront\Catalog::money((float) $game['fromPrice']) }} par mois
                            @endif
                        </li>
                    @endforeach
                </ul>
            </section>

            <section>
                <h2>Inclus dans toutes les offres</h2>
                <ul>
                    @foreach($inclusions as $item)
                        <li><strong>{{ $item['title'] }}</strong> : {{ $item['description'] }}</li>
                    @endforeach
                </ul>
            </section>

            <section id="faq">
                <h2>Questions fréquentes</h2>
                <dl>
                    @foreach($faqs as $faq)
                        <dt>{{ $faq['question'] }}</dt>
                        <dd>{{ $faq['answer'] }}</dd>
                    @endforeach
                </dl>
            </section>
        </main>

        @include('templates.vitrine.ssr.footer')
    </div>
</div>
