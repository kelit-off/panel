@extends('templates.vitrine.legal.layout')

@section('legal-content')
    <p class="intro">
        Vous pensez qu'un service hébergé sur {{ config('app.name') }} diffuse un contenu illicite, ou
        enfreint nos <a href="/cgu">conditions d'utilisation</a> ? Décrivez-le ci-dessous : nous
        accusons réception de chaque signalement et vous répondons personnellement.
    </p>

    @if(session('report_success'))
        <p class="flash-success">
            Votre signalement a bien été transmis, un accusé de réception vient de vous être envoyé par
            email. Nous reviendrons vers vous avec une réponse motivée.
        </p>
    @else
        @if($errors->any())
            <p class="flash-error">{{ $errors->first() }}</p>
        @endif

        <form class="report" method="POST" action="/signalement">
            @csrf
            <label for="reporter_name">Votre nom</label>
            <input type="text" id="reporter_name" name="reporter_name" value="{{ old('reporter_name') }}" required maxlength="191">

            <label for="reporter_email">Votre email</label>
            <input type="email" id="reporter_email" name="reporter_email" value="{{ old('reporter_email') }}" required>

            <label for="category">Nature du contenu signalé</label>
            <select id="category" name="category" required>
                <option value="">Choisissez…</option>
                <option value="illicite" @selected(old('category') === 'illicite')>Contenu illicite</option>
                <option value="ddos" @selected(old('category') === 'ddos')>Attaque réseau / DDoS</option>
                <option value="minage" @selected(old('category') === 'minage')>Minage de cryptomonnaie non autorisé</option>
                <option value="spam" @selected(old('category') === 'spam')>Spam</option>
                <option value="propriete_intellectuelle" @selected(old('category') === 'propriete_intellectuelle')>Atteinte à la propriété intellectuelle</option>
                <option value="autre" @selected(old('category') === 'autre')>Autre</option>
            </select>

            <label for="target">Service concerné (adresse, identifiant, URL…)</label>
            <input type="text" id="target" name="target" value="{{ old('target') }}" required maxlength="500">

            <label for="description">Description du signalement</label>
            <textarea id="description" name="description" required>{{ old('description') }}</textarea>

            <button type="submit">Envoyer le signalement</button>
        </form>
    @endif
@endsection
