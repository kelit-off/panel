<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Search engine visibility
    |--------------------------------------------------------------------------
    |
    | Pages are only offered to search engines in production, so a staging or
    | local copy never ends up indexed. Set SEO_INDEXABLE to force either way.
    | The verification codes are the "content" values given by Google Search
    | Console and Bing Webmaster Tools for the HTML meta tag method.
    |
    */
    // An unset or blank SEO_INDEXABLE falls back to "production only".
    'indexable' => match (strtolower(trim((string) env('SEO_INDEXABLE')))) {
        '1', 'true', 'on', 'yes' => true,
        '0', 'false', 'off', 'no' => false,
        default => env('APP_ENV') === 'production',
    },
    'verification' => [
        'google' => env('GOOGLE_SITE_VERIFICATION'),
        'bing' => env('BING_SITE_VERIFICATION'),
    ],

    'currency' => env('STOREFRONT_CURRENCY') ?: 'EUR',

    /*
    |--------------------------------------------------------------------------
    | Organisation (entity) details
    |--------------------------------------------------------------------------
    |
    | Published in the structured data only when filled in, so that search and
    | AI engines can tie the site to one identifiable business. same_as takes
    | comma separated URLs of profiles you really own (Discord, X, Trustpilot,
    | company register...). Nothing here is invented: leave blank what you do
    | not want to publish.
    |
    */
    'organization' => [
        'legal_name' => env('STOREFRONT_LEGAL_NAME'),
        'email' => env('STOREFRONT_EMAIL'),
        'logo' => env('STOREFRONT_LOGO'),
        'same_as' => array_values(array_filter(array_map('trim', explode(',', (string) env('STOREFRONT_SAME_AS'))))),
    ],

    /*
    |--------------------------------------------------------------------------
    | AI crawlers (generative engine optimisation)
    |--------------------------------------------------------------------------
    |
    | AI_CRAWLERS=allow (default) lets every assistant read the public pages, which
    | is what makes the site quotable. AI_CRAWLERS=search-only keeps assistants
    | that answer users (search and on-demand fetch) and turns away crawlers that
    | collect data for model training. token_only entries are robots.txt control
    | tokens: they never appear as a User-Agent, so they cannot be counted.
    |
    */
    'ai_crawlers' => strtolower(trim((string) env('AI_CRAWLERS'))) === 'search-only' ? 'search-only' : 'allow',

    'ai_bots' => [
        [ 'name' => 'GPTBot', 'operator' => 'OpenAI', 'purpose' => 'training' ],
        [ 'name' => 'OAI-SearchBot', 'operator' => 'OpenAI', 'purpose' => 'search' ],
        [ 'name' => 'ChatGPT-User', 'operator' => 'OpenAI', 'purpose' => 'user' ],
        [ 'name' => 'ClaudeBot', 'operator' => 'Anthropic', 'purpose' => 'training' ],
        [ 'name' => 'Claude-SearchBot', 'operator' => 'Anthropic', 'purpose' => 'search' ],
        [ 'name' => 'Claude-User', 'operator' => 'Anthropic', 'purpose' => 'user' ],
        [ 'name' => 'PerplexityBot', 'operator' => 'Perplexity', 'purpose' => 'search' ],
        [ 'name' => 'Perplexity-User', 'operator' => 'Perplexity', 'purpose' => 'user' ],
        [ 'name' => 'Google-Extended', 'operator' => 'Google (Gemini)', 'purpose' => 'training', 'token_only' => true ],
        [ 'name' => 'Applebot-Extended', 'operator' => 'Apple', 'purpose' => 'training', 'token_only' => true ],
        [ 'name' => 'Applebot', 'operator' => 'Apple', 'purpose' => 'search' ],
        [ 'name' => 'CCBot', 'operator' => 'Common Crawl', 'purpose' => 'training' ],
        [ 'name' => 'meta-externalagent', 'operator' => 'Meta', 'purpose' => 'training' ],
        [ 'name' => 'Amazonbot', 'operator' => 'Amazon', 'purpose' => 'search' ],
        [ 'name' => 'bingbot', 'operator' => 'Microsoft (Bing, Copilot)', 'purpose' => 'search' ],
    ],

    // Referrer hosts (without "www.") that mean a visitor came from an AI assistant.
    'ai_referrers' => [
        'chatgpt.com' => 'ChatGPT',
        'chat.openai.com' => 'ChatGPT',
        'perplexity.ai' => 'Perplexity',
        'gemini.google.com' => 'Gemini',
        'copilot.microsoft.com' => 'Copilot',
        'claude.ai' => 'Claude',
        'chat.mistral.ai' => 'Le Chat',
        'you.com' => 'You.com',
    ],

    'description' => 'Location de serveurs de jeu avec création automatique : choisissez un jeu et une offre, payez, et votre serveur est en ligne en quelques minutes. Anti-DDoS et stockage NVMe inclus.',

    /*
    |--------------------------------------------------------------------------
    | Shared copy
    |--------------------------------------------------------------------------
    |
    | Rendered both by the server (so it is readable without JavaScript) and by
    | the React storefront, hence a single source here.
    |
    */
    'hero' => [
        'title' => 'Votre serveur de jeu, en ligne en quelques minutes.',
        'text' => 'Choisissez un jeu et une offre, payez, et le serveur est créé automatiquement. Factures, support et ressources se gèrent depuis un seul espace client.',
    ],

    'inclusions' => [
        [ 'key' => 'nvme', 'title' => 'Stockage NVMe', 'description' => 'Sur toutes les offres, pour des chargements rapides.' ],
        [ 'key' => 'shield', 'title' => 'Anti-DDoS inclus', 'description' => 'Protection réseau active en permanence, sans surcoût.' ],
        [ 'key' => 'auto', 'title' => 'Création automatique', 'description' => 'Le serveur est installé et démarré dès le paiement.' ],
        [ 'key' => 'support', 'title' => 'Support par ticket', 'description' => 'Une équipe qui connaît vos jeux, depuis votre espace client.' ],
    ],

    'faqs' => [
        [
            'question' => 'Mon serveur est-il vraiment créé automatiquement ?',
            'answer' => 'Oui. Dès le paiement confirmé, la plateforme réserve les ressources, installe le logiciel choisi et démarre le serveur automatiquement.',
        ],
        [
            'question' => 'Puis-je changer de version ou de logiciel ?',
            'answer' => 'Vous choisissez le logiciel et la version exacte à la commande, et pouvez en changer ensuite depuis votre espace client.',
        ],
        [
            'question' => 'L’anti-DDoS est-il vraiment inclus ?',
            'answer' => 'Oui, sur toutes les offres et sans surcoût. Le filtrage réseau reste actif en permanence.',
        ],
        [
            'question' => 'Comment fonctionne le paiement ?',
            'answer' => 'Les services sont facturés au mois. Vous retrouvez vos échéances et factures directement dans votre espace client.',
        ],
        [
            'question' => 'Et si j’ai besoin d’aide ?',
            'answer' => 'Ouvrez un ticket depuis votre espace client : notre support connaît vos jeux et vos logiciels.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Free tool: Minecraft RAM calculator
    |--------------------------------------------------------------------------
    */
    'ram_tool' => [
        'path' => '/outils/calculateur-ram-minecraft',
        'title' => 'Calculateur de RAM pour serveur Minecraft (modpack, plugins)',
        'description' => 'Combien de RAM pour votre serveur Minecraft ? Indiquez le type de serveur, le nombre de mods ou de plugins, les joueurs et la distance d’affichage : le calculateur gratuit estime la mémoire nécessaire.',
        'intro' => 'Indiquez le type de serveur, le nombre de mods ou de plugins, le nombre de joueurs connectés en même temps et la distance d’affichage. Le calculateur estime la mémoire minimale et la mémoire recommandée, puis vous indique l’offre qui convient.',
        'method' => [
            'La mémoire de base dépend du type de serveur : environ 1 Go en vanilla, 1,5 Go avec Paper ou Spigot, et 1,5 Go minimum avec Fabric ou Forge.',
            'Pour un modpack, la mémoire croît avec le nombre de mods, mais moins vite qu’en proportion : passer de 150 à 300 mods ne double pas le besoin. Un modpack technique ou avec génération de monde lourde demande environ 25 % de plus, un modpack léger environ 20 % de moins.',
            'Chaque plugin Paper ou Spigot ajoute environ 30 Mo en moyenne.',
            'Chaque joueur connecté ajoute de la mémoire, davantage quand la distance d’affichage est grande (elle fait charger plus de chunks) et davantage encore avec des mods.',
            'La valeur recommandée ajoute 20 % de marge pour le ramasse-miettes de Java, puis arrondit à la taille d’offre supérieure.',
        ],
        'disclaimer' => 'Il s’agit d’une estimation indicative, construite à partir des recommandations courantes de la communauté Minecraft. Un modpack précis peut demander plus ou moins : mesurez la consommation réelle avec un profileur comme Spark, puis ajustez.',
        'faqs' => [
            [
                'question' => 'Combien de RAM faut-il pour un serveur Minecraft ?',
                'answer' => 'Cela dépend surtout du type de serveur. Un serveur vanilla ou Paper pour quelques amis tourne avec 2 à 4 Go. Un modpack de 100 à 150 mods demande en général 6 à 8 Go, et les très gros modpacks dépassent 10 Go.',
            ],
            [
                'question' => 'Pourquoi ne pas allouer le maximum de RAM ?',
                'answer' => 'Trop de mémoire allouée allonge les pauses du ramasse-miettes de Java et provoque des à-coups. Il vaut mieux allouer ce dont le serveur a besoin, avec une marge raisonnable.',
            ],
            [
                'question' => 'La distance d’affichage change-t-elle vraiment la RAM nécessaire ?',
                'answer' => 'Oui. Une distance plus grande fait charger davantage de chunks par joueur. Réduire la distance d’affichage à 8 ou 10 est l’un des moyens les plus efficaces d’alléger un serveur.',
            ],
            [
                'question' => 'Les mods de génération de monde consomment-ils plus ?',
                'answer' => 'Oui, en général. Les mods qui ajoutent de nouveaux biomes, des structures ou des machines actives en permanence demandent davantage de mémoire et de processeur que des mods d’optimisation ou de confort.',
            ],
        ],
    ],
];
