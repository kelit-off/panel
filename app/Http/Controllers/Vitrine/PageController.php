<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Illuminate\Support\Str;
use Pterodactyl\Models\Nest;
use Illuminate\Http\Response;
use Illuminate\Contracts\View\View;
use Pterodactyl\Services\Storefront\Seo;
use Pterodactyl\Services\Storefront\Catalog;
use Pterodactyl\Services\Storefront\RamToolGuide;
use Pterodactyl\Http\Controllers\Controller;

/**
 * Public storefront pages. Each one is rendered as real HTML on the server
 * (prices and specs as text, structured data in the head) so search engines and
 * AI crawlers that do not run JavaScript can read it; the React app then takes
 * over the same page in the browser.
 */
class PageController extends Controller
{
    public function __construct(private Catalog $catalog, private Seo $seo, private RamToolGuide $ramGuide)
    {
    }

    public function home(): View
    {
        $games = $this->catalog->games();
        $name = $this->seo->siteName();

        $graph = array_merge($this->seo->organization(), [
            [
                '@type' => 'ItemList',
                'name' => 'Jeux disponibles',
                'itemListElement' => $games->map(fn (array $game, int $i) => [
                    '@type' => 'ListItem',
                    'position' => $i + 1,
                    'name' => $game['name'],
                    'url' => $this->seo->url('/jeu/' . $game['slug']),
                ])->values()->all(),
            ],
            $this->seo->faqPage(config('storefront.faqs')),
        ]);

        return view('templates.vitrine.core', [
            'seo' => $this->seo->page(
                "{$name} : location de serveurs de jeu, en ligne en quelques minutes",
                config('storefront.description'),
                '/',
                $graph,
                true,
                '/index.md'
            ),
            'ssr' => 'templates.vitrine.ssr.home',
            'ssrData' => [
                'hero' => config('storefront.hero'),
                'games' => $games,
                'inclusions' => config('storefront.inclusions'),
                'faqs' => config('storefront.faqs'),
            ],
        ]);
    }

    public function game(string $slugJeu): View|Response
    {
        $game = $this->catalog->game($slugJeu);

        if (is_null($game)) {
            // A game that exists but is hidden stays reachable (the storefront
            // still renders it) without being offered to search engines.
            $exists = Nest::query()->get([ 'id', 'name' ])->contains(fn (Nest $nest) => Str::slug($nest->name) === $slugJeu);

            return response()->view('templates.vitrine.core', [ 'seo' => $this->seo->hidden() ], $exists ? 200 : 404);
        }

        $plans = $this->catalog->plans($game['id']);
        $path = '/jeu/' . $game['slug'];
        $name = $game['name'];
        $prices = array_column($plans, 'price');
        $memory = array_column($plans, 'memoryMb');

        $title = "Serveur {$name}";
        $description = "Louez un serveur {$name} avec création automatique, anti-DDoS et stockage NVMe inclus.";
        if (!empty($plans)) {
            $count = count($plans);
            $from = Catalog::money(min($prices));
            $title = "Serveur {$name} : {$count} " . ($count > 1 ? 'offres' : 'offre') . " dès {$from} par mois";
            $description = "Louez un serveur {$name} dès {$from} par mois : {$count} " . ($count > 1 ? 'offres' : 'offre')
                . ' de ' . Catalog::size(min($memory)) . ' à ' . Catalog::size(max($memory))
                . ' de RAM, anti-DDoS et stockage NVMe inclus, installation automatique.';
        }

        $updated = $this->catalog->updatedAt($game['id']);
        $pageTitle = $title . ' | ' . $this->seo->siteName();

        $graph = array_merge($this->seo->organization(), [
            $this->seo->webPage($pageTitle, $path, $description, $updated),
            $this->seo->breadcrumbs([
                [ 'name' => 'Accueil', 'path' => '/' ],
                [ 'name' => $name, 'path' => $path ],
            ]),
        ], array_map(fn (array $plan) => $this->seo->product($name, $path, $plan), $plans));

        return view('templates.vitrine.core', [
            'seo' => $this->seo->page($pageTitle, $description, $path, $graph, true, $path . '.md'),
            'ssr' => 'templates.vitrine.ssr.game',
            'ssrData' => [
                'game' => $game,
                'description' => Nest::query()->whereKey($game['id'])->value('description'),
                'plans' => $plans,
                'summary' => Catalog::summary($name, $plans),
                'updated' => $updated?->locale('fr')->isoFormat('D MMMM YYYY'),
                'games' => $this->catalog->games(),
                'isMinecraft' => Str::contains(Str::lower($name), 'minecraft'),
            ],
        ]);
    }

    public function ramTool(): View
    {
        $guide = $this->ramGuide->data();
        $tool = config('storefront.ram_tool');
        $path = $tool['path'];

        $graph = array_merge($this->seo->organization(), [
            $this->seo->breadcrumbs([
                [ 'name' => 'Accueil', 'path' => '/' ],
                [ 'name' => 'Calculateur de RAM Minecraft', 'path' => $path ],
            ]),
            [
                '@type' => 'WebApplication',
                'name' => 'Calculateur de RAM pour serveur Minecraft',
                'url' => $this->seo->url($path),
                'description' => $tool['description'],
                'applicationCategory' => 'UtilitiesApplication',
                'operatingSystem' => 'Any',
                'browserRequirements' => 'Requires JavaScript',
                'inLanguage' => 'fr-FR',
                'isAccessibleForFree' => true,
                'offers' => [ '@type' => 'Offer', 'price' => '0', 'priceCurrency' => config('storefront.currency', 'EUR') ],
                'publisher' => [ '@id' => $this->seo->url('/#organization') ],
            ],
            $this->seo->faqPage($guide['faqs']),
        ]);

        return view('templates.vitrine.core', [
            'seo' => $this->seo->page($tool['title'] . ' | ' . $this->seo->siteName(), $tool['description'], $path, $graph, true, $path . '.md'),
            'ssr' => 'templates.vitrine.ssr.ram-tool',
            'ssrData' => [
                'guide' => $guide,
                'games' => $this->catalog->games(),
            ],
        ]);
    }
}
