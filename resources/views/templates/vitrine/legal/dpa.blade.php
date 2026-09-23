@extends('templates.vitrine.legal.layout')

@section('legal-content')
    @php($c = config('legal.company'))

    <p class="intro">
        Lorsque vous hébergez des données à caractère personnel sur un serveur loué auprès de
        {{ config('app.name') }}, le présent accord précise les engagements pris en tant que
        sous-traitant au sens de l'article 28 du RGPD. Il est annexé à nos
        <a href="/cgv">conditions générales de vente</a>.
    </p>

    <section>
        <h2>Objet et durée</h2>
        <p>
            {{ config('app.name') }} (le sous-traitant) traite les données que vous (le responsable de
            traitement) hébergez sur votre serveur, pour la seule durée de votre abonnement et dans la
            seule mesure nécessaire à la fourniture du service d'hébergement.
        </p>
    </section>

    <section>
        <h2>Obligations du sous-traitant</h2>
        <ul>
            <li>ne traiter les données que sur instruction documentée du client, sauf obligation légale contraire ;</li>
            <li>garantir la confidentialité des personnes autorisées à traiter les données ;</li>
            <li>mettre en œuvre les mesures de sécurité techniques et organisationnelles appropriées ;</li>
            <li>n'avoir recours à un sous-traitant ultérieur qu'avec l'autorisation préalable du client, ou par autorisation générale documentée ci-dessous ;</li>
            <li>assister le client pour répondre aux demandes d'exercice des droits des personnes concernées ;</li>
            <li>notifier le client de toute violation de données dans les meilleurs délais après en avoir eu connaissance ;</li>
            <li>supprimer ou restituer les données à la fin du contrat, selon le choix du client.</li>
        </ul>
    </section>

    <section>
        <h2>Sous-traitants ultérieurs</h2>
        <p>
            Le client autorise le recours aux sous-traitants ultérieurs suivants, nécessaires à la
            fourniture du service : Stripe (paiement) et OVH SAS (infrastructure d'hébergement). Chacun
            de ces prestataires propose son propre accord de sous-traitance, disponible sur son site.
        </p>
    </section>

    <section>
        <h2>Sort des données en fin de contrat</h2>
        <p>
            À la fin de l'abonnement, les données hébergées sur le serveur sont supprimées après le
            délai de grâce indiqué dans nos CGV, sauf demande expresse de restitution formulée par le
            client avant la suppression effective.
        </p>
    </section>

    <p class="updated">
        <mark class="placeholder">[À COMPLÉTER — ce squelette couvre les points obligatoires de l'article 28 du RGPD mais mérite une relecture juridique avant publication, notamment sur les mesures de sécurité précises et la procédure de notification de violation.]</mark>
    </p>
@endsection
