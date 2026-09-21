<?php

namespace Pterodactyl\Services\Storefront;

/**
 * Builds the search-engine facing parts of a storefront page: robots policy,
 * canonical URL and schema.org JSON-LD. Pages only describe what a visitor can
 * also read on them (prices, specs, FAQ), as search engines require.
 */
class Seo
{
    public function siteName(): string
    {
        return (string) config('app.name', 'Pterodactyl');
    }

    public function url(string $path = '/'): string
    {
        return rtrim((string) config('app.url'), '/') . '/' . ltrim($path, '/');
    }

    public function indexable(): bool
    {
        return (bool) config('storefront.indexable');
    }

    /**
     * @param array<int, array<string, mixed>> $graph schema.org nodes for the page
     */
    public function page(string $title, string $description, string $path, array $graph = [], bool $index = true, ?string $markdownPath = null): array
    {
        return [
            // Plain Markdown twin of the page, easier for AI assistants to ingest than HTML.
            'markdown' => $markdownPath ? $this->url($markdownPath) : null,
            'title' => $title,
            'description' => $description,
            'canonical' => $this->url($path),
            'robots' => ($index && $this->indexable()) ? 'index,follow,max-image-preview:large' : 'noindex,nofollow',
            'siteName' => $this->siteName(),
            'verification' => array_filter(config('storefront.verification', [])),
            'jsonLd' => empty($graph) ? null : [ '@context' => 'https://schema.org', '@graph' => $graph ],
        ];
    }

    /** For pages that exist but must stay out of search results (checkout, account...). */
    public function hidden(): array
    {
        $page = $this->page($this->siteName(), (string) config('storefront.description'), '/', [], false);

        // A page kept out of results must not claim another page as its canonical.
        $page['canonical'] = null;

        return $page;
    }

    /** The Organization node, extended only with details the owner chose to publish. */
    private function organizationNode(): array
    {
        $details = config('storefront.organization', []);
        $node = [ '@type' => 'Organization', '@id' => $this->url('/#organization'), 'name' => $this->siteName(), 'url' => $this->url('/') ];

        if (!empty($details['legal_name'])) {
            $node['legalName'] = $details['legal_name'];
        }
        if (!empty($details['logo'])) {
            $node['logo'] = preg_match('#^https?://#i', $details['logo']) ? $details['logo'] : $this->url($details['logo']);
        }
        if (!empty($details['email'])) {
            $node['email'] = $details['email'];
            $node['contactPoint'] = [ '@type' => 'ContactPoint', 'contactType' => 'customer support', 'email' => $details['email'], 'availableLanguage' => 'French' ];
        }
        if (!empty($details['same_as'])) {
            $node['sameAs'] = $details['same_as'];
        }

        return $node;
    }

    /** @return array<string, mixed> a WebPage node with its last modification date, a freshness signal for engines */
    public function webPage(string $name, string $path, string $description, ?\DateTimeInterface $modified = null): array
    {
        $node = [
            '@type' => 'WebPage',
            '@id' => $this->url($path . '#webpage'),
            'url' => $this->url($path),
            'name' => $name,
            'description' => $description,
            'inLanguage' => 'fr-FR',
            'isPartOf' => [ '@id' => $this->url('/#website') ],
            'publisher' => [ '@id' => $this->url('/#organization') ],
        ];

        if ($modified) {
            $node['dateModified'] = $modified->format(\DateTimeInterface::ATOM);
        }

        return $node;
    }

    /** @return array<int, array<string, mixed>> */
    public function organization(): array
    {
        return [
            $this->organizationNode(),
            [
                '@type' => 'WebSite',
                '@id' => $this->url('/#website'),
                'url' => $this->url('/'),
                'name' => $this->siteName(),
                'inLanguage' => 'fr-FR',
                'publisher' => [ '@id' => $this->url('/#organization') ],
            ],
        ];
    }

    /**
     * @param array<int, array{name: string, path: string}> $trail
     */
    public function breadcrumbs(array $trail): array
    {
        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn (array $crumb, int $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $crumb['name'],
                'item' => $this->url($crumb['path']),
            ], $trail, array_keys($trail)),
        ];
    }

    /**
     * @param array<int, array{question: string, answer: string}> $faqs
     */
    public function faqPage(array $faqs): array
    {
        return [
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $faq) => [
                '@type' => 'Question',
                'name' => $faq['question'],
                'acceptedAnswer' => [ '@type' => 'Answer', 'text' => $faq['answer'] ],
            ], $faqs),
        ];
    }

    /** One plan as a schema.org Product with a monthly Offer. */
    public function product(string $game, string $gamePath, array $plan): array
    {
        $price = number_format($plan['price'], 2, '.', '');
        $currency = (string) config('storefront.currency', 'EUR');

        return [
            '@type' => 'Product',
            'name' => "Serveur {$game} {$plan['name']}",
            'description' => $plan['description'] ?: "Serveur {$game} avec " . $plan['specs']['RAM'] . ' de RAM.',
            'category' => $game,
            'brand' => [ '@id' => $this->url('/#organization') ],
            'additionalProperty' => array_values(array_map(
                fn (string $name, string $value) => [ '@type' => 'PropertyValue', 'name' => $name, 'value' => $value ],
                array_keys($plan['specs']),
                array_values($plan['specs'])
            )),
            'offers' => [
                '@type' => 'Offer',
                'url' => $this->url($gamePath),
                'price' => $price,
                'priceCurrency' => $currency,
                'availability' => 'https://schema.org/InStock',
                'priceSpecification' => [
                    '@type' => 'UnitPriceSpecification',
                    'price' => $price,
                    'priceCurrency' => $currency,
                    'billingDuration' => 1,
                    'billingIncrement' => 1,
                    'unitCode' => 'MON',
                ],
            ],
        ];
    }
}
