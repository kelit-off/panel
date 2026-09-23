@extends('templates.vitrine.legal.layout')

@section('legal-content')
    @php($c = config('legal.company'))

    <p class="intro">
        Les présentes conditions générales de vente (CGV) s'appliquent à toute commande passée sur
        {{ config('app.name') }} par un client, particulier ou professionnel. Passer commande implique
        l'acceptation pleine et entière de ces conditions.
    </p>

    <section>
        <h2>1. Objet</h2>
        <p>
            {{ config('app.name') }} propose à la location des serveurs privés virtuels préconfigurés pour
            l'hébergement de jeux vidéo et de logiciels associés, avec création et mise en service
            automatisées après paiement.
        </p>
    </section>

    <section>
        <h2>2. Prix</h2>
        <p>
            Les prix affichés sur le site sont en euros, toutes taxes comprises (TTC). Ils sont
            facturés mensuellement, à la date anniversaire du premier paiement, par prélèvement
            automatique sur le moyen de paiement enregistré. Une facture est émise automatiquement
            à chaque échéance et disponible depuis l'espace client.
        </p>
    </section>

    <section>
        <h2>3. Durée et renouvellement</h2>
        <p>
            L'abonnement est conclu pour une durée d'un mois, reconduit tacitement par période d'un
            mois à défaut de résiliation par le client avant l'échéance suivante.
        </p>
    </section>

    <section>
        <h2>4. Résiliation</h2>
        <p>
            Le client peut résilier son abonnement à tout moment, sans frais ni justification, depuis
            son espace client au moyen du bouton « Résilier mon contrat » (accessible en trois clics au
            maximum, conformément à l'article L215-1-1 du Code de la consommation). La résiliation
            prend effet immédiatement : le serveur est suspendu puis supprimé après un court délai de
            grâce. Les sommes déjà versées pour la période en cours ne donnent pas lieu à
            remboursement, en dehors du délai de rétractation décrit à l'article 5.
        </p>
        <p>
            {{ config('app.name') }} peut suspendre ou résilier un service en cas de manquement du
            client aux conditions d'utilisation acceptables (voir nos <a href="/cgu">CGU</a>), notamment
            en cas de défaut de paiement, d'usage illicite ou d'atteinte à la sécurité du réseau.
        </p>
    </section>

    <section>
        <h2>5. Droit de rétractation (clients particuliers)</h2>
        <p>
            Conformément à l'article L221-18 du Code de la consommation, le client consommateur
            dispose d'un délai de 14 jours à compter de la commande pour exercer son droit de
            rétractation, sans avoir à justifier de motif.
        </p>
        <p>
            Le service proposé étant fourni immédiatement (le serveur est créé automatiquement dès le
            paiement confirmé), le client est invité, au moment de la commande, à demander
            expressément l'exécution immédiate du service au moyen d'une case à cocher dédiée. Il
            reconnaît alors que, conformément à l'article L221-28 1°, son droit de rétractation
            s'éteint une fois le service pleinement exécuté.
        </p>
        <p>
            S'agissant d'un service à exécution continue (abonnement mensuel), le client conserve la
            possibilité de se rétracter à tout moment durant les 14 jours suivant le premier paiement.
            En ce cas, conformément à l'article L221-25, il est tenu au paiement d'un montant
            correspondant au service déjà fourni jusqu'à la communication de sa rétractation, calculé
            au prorata de la durée écoulée depuis le paiement ; le solde lui est remboursé. Cette
            rétractation s'effectue depuis l'espace client, séparément d'une simple résiliation, et
            entraîne la suppression immédiate du serveur.
        </p>
        <p>
            Le droit de rétractation ne peut être exercé pour la garantie légale de conformité, qui
            reste due indépendamment de ce délai (article 6).
        </p>
    </section>

    <section>
        <h2>6. Garantie légale de conformité</h2>
        <p>
            Le service fourni bénéficie de la garantie légale de conformité applicable aux contenus et
            services numériques (articles L224-25-12 et suivants du Code de la consommation). En cas de
            défaut de conformité, le client peut demander la mise en conformité du service ou, à
            défaut, la réduction du prix ou la résolution du contrat, dans les conditions prévues par
            la loi. Cette garantie s'exerce en ouvrant un ticket depuis l'espace client.
        </p>
    </section>

    <section>
        <h2>7. Niveau de service (SLA)</h2>
        <p>
            {{ config('app.name') }} met en œuvre les moyens raisonnables pour assurer la disponibilité
            du service, avec un objectif de disponibilité de <mark class="placeholder">{{ config('legal.sla.uptime') }}</mark>
            par mois, hors opérations de maintenance planifiée annoncées à l'avance et cas de force
            majeure. <mark class="placeholder">[À COMPLÉTER — préciser les compensations éventuelles en cas de non-respect de cet engagement, le cas échéant]</mark>.
        </p>
    </section>

    <section>
        <h2>8. Responsabilité</h2>
        <p>
            {{ config('app.name') }} met à disposition l'infrastructure technique mais n'a pas accès
            aux contenus hébergés par le client, dont celui-ci est seul responsable. La responsabilité
            de {{ config('app.name') }} ne saurait être engagée en cas de perte de données résultant
            d'une mauvaise utilisation du service par le client, d'une interruption imputable à un
            tiers (opérateur réseau, fournisseur d'accès) ou d'un cas de force majeure.
            <mark class="placeholder">[À COMPLÉTER — plafond de responsabilité et exclusions précises, à valider juridiquement]</mark>.
        </p>
    </section>

    <section>
        <h2>9. Données personnelles</h2>
        <p>
            Le traitement des données personnelles du client est décrit dans notre
            <a href="/confidentialite">politique de confidentialité</a>. Lorsque le client héberge lui-même
            des données à caractère personnel sur son serveur, les modalités de sous-traitance sont
            précisées dans <a href="/dpa">l'accord de sous-traitance (DPA)</a> annexé aux présentes CGV.
        </p>
    </section>

    <section>
        <h2>10. Médiation et litiges</h2>
        <p>
            En cas de litige, le client consommateur peut recourir au médiateur de la consommation
            désigné dans nos <a href="/mentions-legales">mentions légales</a>. À défaut de résolution
            amiable, les tribunaux français sont seuls compétents, sous réserve des règles impératives
            protectrices applicables aux consommateurs.
        </p>
    </section>
@endsection
