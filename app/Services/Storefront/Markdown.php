<?php

namespace Pterodactyl\Services\Storefront;

/**
 * Markdown versions of the public pages, built from the same data as the HTML
 * so the two can never disagree. Plain Markdown is the format AI assistants
 * ingest most reliably: no scripts, no layout, tables kept as tables.
 */
class Markdown
{
    public function __construct(private Catalog $catalog, private Seo $seo, private RamToolGuide $guide)
    {
    }

    public function home(): string
    {
        $hero = config('storefront.hero');
        $lines = [
            '# ' . $this->seo->siteName() . ' : ' . $hero['title'],
            '',
            $hero['text'],
            '',
            '## Jeux disponibles',
            '',
        ];

        foreach ($this->catalog->games() as $game) {
            $from = $game['fromPrice'] ? ' : dès ' . Catalog::money((float) $game['fromPrice']) . ' par mois' : '';
            $lines[] = "- [Serveur {$game['name']}](" . $this->seo->url('/jeu/' . $game['slug']) . "){$from}";
        }

        array_push($lines, '', '## Inclus dans toutes les offres', '');
        foreach (config('storefront.inclusions') as $item) {
            $lines[] = "- **{$item['title']}** : {$item['description']}";
        }

        array_push($lines, '', '## Questions fréquentes', '');
        foreach (config('storefront.faqs') as $faq) {
            array_push($lines, "### {$faq['question']}", '', $faq['answer'], '');
        }

        $lines[] = 'Version HTML : ' . $this->seo->url('/');

        return $this->join($lines);
    }

    /** @param array{id: int, name: string, slug: string} $game */
    public function game(array $game): string
    {
        $plans = $this->catalog->plans($game['id']);
        $updated = $this->catalog->updatedAt($game['id']);

        $lines = [ "# Serveur {$game['name']}", '', Catalog::summary($game['name'], $plans), '' ];

        if ($updated) {
            $lines[] = 'Tarifs mis à jour le ' . $updated->locale('fr')->isoFormat('D MMMM YYYY') . '.';
            $lines[] = '';
        }

        if (!empty($plans)) {
            $lines[] = '## Offres et prix';
            $lines[] = '';
            $lines[] = '| Offre | Prix par mois | RAM | CPU | Disque | Bases de données | Sauvegardes | Ports |';
            $lines[] = '| --- | --- | --- | --- | --- | --- | --- | --- |';

            foreach ($plans as $plan) {
                $s = $plan['specs'];
                $lines[] = '| ' . implode(' | ', [
                    $this->cell($plan['name']), $plan['priceLabel'], $s['RAM'], $s['CPU'], $s['Disque'],
                    $s['Bases de données'], $s['Sauvegardes'], $s['Ports'],
                ]) . ' |';
            }

            array_push($lines, '', '## Commander', '');
            foreach ($plans as $plan) {
                $lines[] = "- [Commander {$game['name']} {$plan['name']}](" . $this->seo->url('/commande/' . $plan['id']) . ") : {$plan['priceLabel']} par mois";
            }
            $lines[] = '';
        }

        $lines[] = 'Version HTML : ' . $this->seo->url('/jeu/' . $game['slug']);

        return $this->join($lines);
    }

    public function tool(): string
    {
        $guide = $this->guide->data();
        $lines = [ '# Calculateur de RAM pour serveur Minecraft', '', $guide['intro'], '', '## Exemples de configurations', '' ];

        $lines[] = '| Cas | Configuration | RAM minimale | RAM recommandée | Offre conseillée |';
        $lines[] = '| --- | --- | --- | --- | --- |';
        foreach ($guide['scenarios'] as $scenario) {
            $plan = $scenario['plan'] ? "{$scenario['plan']['name']} ({$scenario['plan']['priceLabel']} par mois)" : 'Sur mesure';
            $lines[] = '| ' . implode(' | ', [
                $this->cell($scenario['label']), $this->cell($scenario['summary']),
                $scenario['minimumGb'] . ' Go', $scenario['recommendedGb'] . ' Go', $this->cell($plan),
            ]) . ' |';
        }

        array_push($lines, '', '## Comment l’estimation est calculée', '');
        foreach ($guide['method'] as $line) {
            $lines[] = "- {$line}";
        }
        array_push($lines, '', $guide['disclaimer'], '', '## Questions fréquentes', '');
        foreach ($guide['faqs'] as $faq) {
            array_push($lines, "### {$faq['question']}", '', $faq['answer'], '');
        }

        $lines[] = 'Calculateur interactif : ' . $this->seo->url(config('storefront.ram_tool.path'));

        return $this->join($lines);
    }

    /** Every page in one document, for assistants that prefer a single file. */
    public function full(): string
    {
        $parts = [ $this->home() ];
        foreach ($this->catalog->games() as $game) {
            if (!empty($this->catalog->plans($game['id']))) {
                $parts[] = $this->game($game);
            }
        }
        $parts[] = $this->tool();

        return implode("\n\n---\n\n", $parts) . "\n";
    }

    private function cell(string $text): string
    {
        return str_replace('|', '\\|', $text);
    }

    private function join(array $lines): string
    {
        return implode("\n", $lines) . "\n";
    }
}
