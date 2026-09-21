<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Carbon\Carbon;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Product;
use Illuminate\Http\Response;
use Pterodactyl\Services\Storefront\Seo;
use Pterodactyl\Services\Storefront\Catalog;
use Pterodactyl\Services\Storefront\Markdown;
use Pterodactyl\Http\Controllers\Controller;

/**
 * Machine-readable entry points for crawlers and AI assistants: robots.txt,
 * sitemap.xml, llms.txt and the Markdown twins of the public pages.
 */
class SeoController extends Controller
{
    private const PRIVATE_PATHS = [ '/admin', '/auth', '/account', '/server', '/api/', '/commande' ];

    public function __construct(private Seo $seo, private Catalog $catalog, private Markdown $markdown)
    {
    }

    public function robots(): Response
    {
        if (!$this->seo->indexable()) {
            // Anything that is not production: keep the whole site out of search engines.
            return $this->text("User-agent: *\nDisallow: /\n");
        }

        $private = array_map(fn (string $path) => "Disallow: {$path}", self::PRIVATE_PATHS);
        $lines = array_merge([ 'User-agent: *', 'Allow: /' ], $private, [ '' ]);

        // A crawler that has its own group ignores the "*" group, so every AI agent
        // gets the full set of rules spelled out rather than only "Allow: /".
        $searchOnly = config('storefront.ai_crawlers') === 'search-only';
        $lines[] = $searchOnly
            ? '# AI assistants: answering users is allowed, collecting data to train models is not.'
            : '# AI assistants: welcome, the public pages are meant to be quoted.';

        foreach (config('storefront.ai_bots') as $bot) {
            $lines[] = "User-agent: {$bot['name']}";
            if ($searchOnly && $bot['purpose'] === 'training') {
                $lines[] = 'Disallow: /';
            } else {
                $lines[] = 'Allow: /';
                array_push($lines, ...$private);
            }
            $lines[] = '';
        }

        $lines[] = 'Sitemap: ' . $this->seo->url('/sitemap.xml');

        return $this->text(implode("\n", $lines) . "\n");
    }

    /**
     * llms.txt: a short Markdown map of the site for AI assistants (see llmstxt.org).
     * It points at the Markdown twins of the pages, where the full details live.
     */
    public function llms(): Response
    {
        $lines = [
            '# ' . $this->seo->siteName(),
            '',
            '> ' . config('storefront.description'),
            '',
            'Les prix sont en euros par mois. Le serveur est créé automatiquement après le paiement. Anti-DDoS et stockage NVMe sont inclus sur toutes les offres.',
            '',
            '## Jeux et offres',
            '',
        ];

        foreach ($this->catalog->games() as $game) {
            $plans = $this->catalog->plans($game['id']);
            // A game with nothing to sell yet is noise for an assistant looking for answers.
            if (empty($plans)) {
                continue;
            }

            $lines[] = "- [Serveur {$game['name']}](" . $this->seo->url('/jeu/' . $game['slug'] . '.md') . '): ' . Catalog::summary($game['name'], $plans);
        }

        $tool = config('storefront.ram_tool');
        array_push(
            $lines,
            '',
            '## Outils gratuits',
            '',
            '- [' . $tool['title'] . '](' . $this->seo->url($tool['path'] . '.md') . '): ' . $tool['description'],
            '',
            '## À propos',
            '',
            '- [Présentation et questions fréquentes](' . $this->seo->url('/index.md') . '): ce que fait ' . $this->seo->siteName() . ', ce qui est inclus, paiement et support.',
            '',
            '## Optionnel',
            '',
            '- [Tout le contenu en un seul fichier](' . $this->seo->url('/llms-full.txt') . ')',
            '- [Plan du site](' . $this->seo->url('/sitemap.xml') . ')'
        );

        return $this->text(implode("\n", $lines) . "\n");
    }

    public function llmsFull(): Response
    {
        return $this->text($this->markdown->full());
    }

    public function homeMarkdown(): Response
    {
        return $this->markdownResponse($this->markdown->home(), '/');
    }

    public function gameMarkdown(string $slugJeu): Response
    {
        $game = $this->catalog->game($slugJeu);
        abort_if(is_null($game), 404);

        return $this->markdownResponse($this->markdown->game($game), '/jeu/' . $game['slug']);
    }

    public function toolMarkdown(): Response
    {
        return $this->markdownResponse($this->markdown->tool(), config('storefront.ram_tool.path'));
    }

    public function sitemap(): Response
    {
        $games = $this->catalog->games();

        // Last change per game: its own record or any of its plans, whichever is newer.
        $nestChanged = Nest::query()->whereIn('id', $games->pluck('id'))->pluck('updated_at', 'id');
        $productChanged = Product::query()->whereIn('nest_id', $games->pluck('id'))->selectRaw('nest_id, MAX(updated_at) as changed')->groupBy('nest_id')->pluck('changed', 'nest_id');

        $urls = [];
        $latest = null;
        foreach ($games as $game) {
            $changed = collect([ $nestChanged[$game['id']] ?? null, $productChanged[$game['id']] ?? null ])->filter()->map(fn ($date) => Carbon::parse($date))->max();
            $latest = collect([ $latest, $changed ])->filter()->max();
            $urls[] = [ 'loc' => $this->seo->url('/jeu/' . $game['slug']), 'lastmod' => $changed, 'priority' => '0.8' ];
        }

        array_unshift($urls, [ 'loc' => $this->seo->url('/'), 'lastmod' => $latest, 'priority' => '1.0' ]);
        $urls[] = [ 'loc' => $this->seo->url(config('storefront.ram_tool.path')), 'lastmod' => null, 'priority' => '0.7' ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $url) {
            $xml .= "  <url>\n    <loc>" . htmlspecialchars($url['loc'], ENT_XML1) . "</loc>\n";
            if ($url['lastmod']) {
                $xml .= '    <lastmod>' . $url['lastmod']->toAtomString() . "</lastmod>\n";
            }
            $xml .= '    <priority>' . $url['priority'] . "</priority>\n  </url>\n";
        }
        $xml .= "</urlset>\n";

        return response($xml, 200, [ 'Content-Type' => 'application/xml; charset=UTF-8' ]);
    }

    private function text(string $body): Response
    {
        return response($body, 200, [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

    /** The canonical Link header tells search engines the HTML page is the one to index. */
    private function markdownResponse(string $body, string $canonicalPath): Response
    {
        return response($body, 200, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Link' => '<' . $this->seo->url($canonicalPath) . '>; rel="canonical"',
        ]);
    }
}
