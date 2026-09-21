<div class="ssr">
    <div class="wrap">
        @include('templates.vitrine.ssr.nav')

        <main>
            <p><a href="/">Accueil</a></p>
            <h1>Calculateur de RAM pour serveur Minecraft</h1>
            <p>{{ $guide['intro'] }}</p>
            <noscript><p>Le calculateur interactif nécessite JavaScript. Les exemples ci-dessous donnent les ordres de grandeur pour les cas courants.</p></noscript>

            <section>
                <h2>Exemples de configurations</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Cas</th>
                            <th>Configuration</th>
                            <th>RAM minimale</th>
                            <th>RAM recommandée</th>
                            <th>Offre conseillée</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($guide['scenarios'] as $scenario)
                            <tr>
                                <td>{{ $scenario['label'] }}</td>
                                <td>{{ $scenario['summary'] }}</td>
                                <td>{{ $scenario['minimumGb'] }} Go</td>
                                <td>{{ $scenario['recommendedGb'] }} Go</td>
                                <td>
                                    @if($scenario['plan'])
                                        <a href="/commande/{{ $scenario['plan']['id'] }}">{{ $scenario['plan']['name'] }}</a> ({{ $scenario['plan']['priceLabel'] }} par mois)
                                    @else
                                        Nous contacter
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Comment l’estimation est calculée</h2>
                <ul>
                    @foreach($guide['method'] as $line)
                        <li>{{ $line }}</li>
                    @endforeach
                </ul>
                <p>{{ $guide['disclaimer'] }}</p>
            </section>

            <section>
                <h2>Questions fréquentes</h2>
                <dl>
                    @foreach($guide['faqs'] as $faq)
                        <dt>{{ $faq['question'] }}</dt>
                        <dd>{{ $faq['answer'] }}</dd>
                    @endforeach
                </dl>
            </section>
        </main>

        @include('templates.vitrine.ssr.footer')
    </div>
</div>
