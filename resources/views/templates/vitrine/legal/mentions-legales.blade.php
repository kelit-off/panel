@extends('templates.vitrine.legal.layout')

@section('legal-content')
    @php($c = config('legal.company'))
    @php($h = config('legal.host'))

    <section>
        <h2>Éditeur du site</h2>
        <p>
            {{ config('app.name') }} est édité par <mark class="placeholder">{{ $c['name'] }}</mark>,
            société <mark class="placeholder">{{ $c['form'] }}</mark> au capital social de <mark class="placeholder">{{ $c['capital'] }}</mark>,
            dont le siège social est situé <mark class="placeholder">{{ $c['address'] }}</mark>,
            immatriculée au Registre du commerce et des sociétés de <mark class="placeholder">{{ $c['rcs'] }}</mark>
            sous le numéro SIREN <mark class="placeholder">{{ $c['siren'] }}</mark>,
            numéro de TVA intracommunautaire <mark class="placeholder">{{ $c['vat'] }}</mark>.
        </p>
        <p>
            Directeur de la publication : <mark class="placeholder">{{ $c['publication_director'] }}</mark>.
        </p>
        <p>
            Contact : <mark class="placeholder">{{ $c['contact_email'] }}</mark> —
            <mark class="placeholder">{{ $c['contact_phone'] }}</mark>
        </p>
    </section>

    <section>
        <h2>Hébergement</h2>
        <p>
            Le site et les serveurs de jeu proposés à la location sont hébergés par {{ $h['name'] }},
            {{ $h['address'] }}.
        </p>
        <p class="updated">{{ $h['note'] }}</p>
    </section>

    <section>
        <h2>Propriété intellectuelle</h2>
        <p>
            L'ensemble des éléments du site (textes, logo, mise en page, base de données) est protégé au
            titre du droit d'auteur et du droit des bases de données. Toute reproduction, même partielle,
            sans autorisation préalable est interdite.
        </p>
    </section>

    <section>
        <h2>Médiation de la consommation</h2>
        <p>
            Conformément aux articles L616-1 et R616-1 du Code de la consommation, en cas de litige non
            résolu directement avec notre service client, vous pouvez recourir gratuitement au service de
            médiation suivant :
            <mark class="placeholder">{{ config('legal.mediator.name') }}</mark>
            (<mark class="placeholder">{{ config('legal.mediator.address') }}</mark>,
            <mark class="placeholder">{{ config('legal.mediator.url') }}</mark>).
        </p>
    </section>

    <section>
        <h2>Signaler un contenu</h2>
        <p>
            Si vous estimez qu'un service hébergé sur notre plateforme diffuse un contenu illicite,
            vous pouvez le signaler via notre <a href="/signalement">formulaire de signalement</a>.
        </p>
    </section>
@endsection
