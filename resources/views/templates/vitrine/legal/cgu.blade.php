@extends('templates.vitrine.legal.layout')

@section('legal-content')
    <p class="intro">
        Ces conditions générales d'utilisation (CGU) définissent les usages autorisés et interdits des
        serveurs loués sur {{ config('app.name') }}. Elles complètent nos <a href="/cgv">CGV</a> et
        s'appliquent à tout titulaire d'un service actif.
    </p>

    <section>
        <h2>Usages interdits</h2>
        <p>Il est strictement interdit d'utiliser un service {{ config('app.name') }} pour :</p>
        <ul>
            <li>héberger, diffuser ou faciliter l'accès à des contenus illicites (contenus pédopornographiques, incitation à la haine ou à la violence, contrefaçon, contenus protégés diffusés sans autorisation, etc.) ;</li>
            <li>mener ou participer à des attaques par déni de service (DDoS), du scan de ports ou toute autre activité malveillante visant des tiers ;</li>
            <li>miner des cryptomonnaies sans autorisation écrite préalable de {{ config('app.name') }} ;</li>
            <li>envoyer des communications non sollicitées en masse (spam) ;</li>
            <li>porter atteinte à la sécurité, à l'intégrité ou à la disponibilité de l'infrastructure ou des services d'autres clients ;</li>
            <li>contourner les limites de ressources allouées au service.</li>
        </ul>
    </section>

    <section>
        <h2>Signalement</h2>
        <p>
            Tout tiers constatant un usage contraire à ces règles peut le signaler via notre
            <a href="/signalement">formulaire de signalement</a>. Chaque signalement fait l'objet d'un
            accusé de réception et d'une réponse motivée.
        </p>
    </section>

    <section>
        <h2>Sanctions</h2>
        <p>
            En cas de manquement constaté à ces CGU, {{ config('app.name') }} peut, selon la gravité et
            sans préavis pour les cas les plus graves :
        </p>
        <ol>
            <li>adresser un avertissement au client, avec un délai pour se mettre en conformité ;</li>
            <li>suspendre temporairement le service concerné ;</li>
            <li>résilier le service sans remboursement, en cas de manquement grave ou répété.</li>
        </ol>
        <p>
            Le client concerné est informé par email des motifs de la mesure prise à son encontre.
        </p>
    </section>
@endsection
