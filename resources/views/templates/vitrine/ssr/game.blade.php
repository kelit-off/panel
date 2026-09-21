<div class="ssr">
    <div class="wrap">
        @include('templates.vitrine.ssr.nav')

        <main>
            <p><a href="/">Tous les jeux</a></p>
            <h1>{{ $game['name'] }}</h1>
            <p><strong>{{ $summary }}</strong></p>
            @if($description)
                <p>{{ $description }}</p>
            @endif
            @if($updated)
                <p><small>Tarifs mis à jour le {{ $updated }}.</small></p>
            @endif

            @if(count($plans) === 0)
                <p>Aucune offre n’est disponible pour ce jeu pour le moment.</p>
            @else
                <div class="plans">
                    @foreach($plans as $plan)
                        <article class="plan">
                            <h2>{{ $plan['name'] }}</h2>
                            @if($plan['description'])
                                <p>{{ $plan['description'] }}</p>
                            @endif
                            <p class="price"><strong>{{ $plan['priceLabel'] }}</strong> par mois</p>
                            <dl class="specs">
                                @foreach($plan['specs'] as $label => $value)
                                    <dt>{{ $label }}</dt>
                                    <dd>{{ $value }}</dd>
                                @endforeach
                            </dl>
                            <p><a href="/commande/{{ $plan['id'] }}">Commander {{ $game['name'] }} {{ $plan['name'] }}</a></p>
                        </article>
                    @endforeach
                </div>
                <p>Anti-DDoS et stockage NVMe inclus sur toutes les offres.</p>

                <h2>Comparatif des offres {{ $game['name'] }}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Caractéristique</th>
                            @foreach($plans as $plan)
                                <th>{{ $plan['name'] }}</th>
                            @endforeach
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Prix par mois</th>
                            @foreach($plans as $plan)
                                <td>{{ $plan['priceLabel'] }}</td>
                            @endforeach
                        </tr>
                        @foreach(array_keys($plans[0]['specs']) as $label)
                            <tr>
                                <th>{{ $label }}</th>
                                @foreach($plans as $plan)
                                    <td>{{ $plan['specs'][$label] }}</td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if($isMinecraft)
                <p>Pas sûr de la mémoire dont vous avez besoin ? Essayez le <a href="{{ config('storefront.ram_tool.path') }}">calculateur de RAM pour serveur Minecraft</a>.</p>
            @endif
        </main>

        @include('templates.vitrine.ssr.footer')
    </div>
</div>
