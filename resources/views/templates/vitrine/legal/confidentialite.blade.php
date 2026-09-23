@extends('templates.vitrine.legal.layout')

@section('legal-content')
    @php($c = config('legal.company'))

    <p class="intro">
        {{ config('app.name') }} attache de l'importance à la protection de vos données personnelles.
        Cette politique explique quelles données nous traitons, pourquoi, et quels sont vos droits,
        conformément au Règlement général sur la protection des données (RGPD).
    </p>

    <section>
        <h2>Responsable de traitement</h2>
        <p>
            Le responsable du traitement est <mark class="placeholder">{{ $c['name'] }}</mark>,
            <mark class="placeholder">{{ $c['address'] }}</mark>. Pour toute question relative à vos
            données, vous pouvez nous contacter à
            <mark class="placeholder">{{ config('legal.dpo_email') }}</mark>.
        </p>
    </section>

    <section>
        <h2>Données collectées et finalités</h2>
        <table>
            <thead>
                <tr><th>Données</th><th>Finalité</th><th>Base légale</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Identifiant de compte, email</td>
                    <td>Création et gestion du compte client</td>
                    <td>Exécution du contrat</td>
                </tr>
                <tr>
                    <td>Données de facturation (traitées par Stripe)</td>
                    <td>Paiement de l'abonnement, émission des factures</td>
                    <td>Exécution du contrat, obligation légale</td>
                </tr>
                <tr>
                    <td>Journaux techniques du serveur loué</td>
                    <td>Sécurité, diagnostic, lutte contre la fraude et les abus</td>
                    <td>Intérêt légitime</td>
                </tr>
                <tr>
                    <td>Visites du site (sans cookie, identifiant anonyme changé chaque jour)</td>
                    <td>Statistiques de fréquentation et d'origine du trafic</td>
                    <td>Intérêt légitime</td>
                </tr>
            </tbody>
        </table>
        <p>
            Le suivi des visites du site ne dépose aucun cookie et n'utilise pas votre adresse IP : un
            identifiant à usage unique, recalculé chaque jour, empêche de vous suivre d'une visite à
            l'autre.
        </p>
    </section>

    <section>
        <h2>Sous-traitants</h2>
        <ul>
            <li><strong>Stripe</strong> — traitement des paiements et facturation.</li>
            <li><strong>OVH SAS</strong> — hébergement de l'infrastructure serveur.</li>
        </ul>
        <p>
            Lorsque vous hébergez vous-même des données à caractère personnel sur le serveur que vous
            louez, {{ config('app.name') }} agit comme sous-traitant à votre égard : les modalités sont
            précisées dans notre <a href="/dpa">accord de sous-traitance (DPA)</a>.
        </p>
    </section>

    <section>
        <h2>Durées de conservation</h2>
        <p>
            Les données de votre compte sont conservées pendant la durée de la relation contractuelle,
            puis <mark class="placeholder">{{ config('legal.retention_customer_data') }}</mark> après
            sa fin, y compris pour satisfaire nos obligations légales de conservation. Les journaux de
            connexion sont conservés
            <mark class="placeholder">{{ config('legal.retention_connection_logs') }}</mark>.
        </p>
    </section>

    <section>
        <h2>Vos droits</h2>
        <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
            de limitation et d'opposition, ainsi que d'un droit à la portabilité de vos données. Vous
            pouvez exercer ces droits en nous écrivant à
            <mark class="placeholder">{{ config('legal.dpo_email') }}</mark>. Vous disposez également
            du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
        </p>
    </section>
@endsection
