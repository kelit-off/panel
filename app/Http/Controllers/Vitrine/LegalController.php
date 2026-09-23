<?php

namespace Pterodactyl\Http\Controllers\Vitrine;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Notification;
use Pterodactyl\Models\ContentReport;
use Pterodactyl\Services\Storefront\Seo;
use Pterodactyl\Services\Storefront\Catalog;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Notifications\ContentReportReceived;
use Pterodactyl\Notifications\ContentReportAcknowledged;

/**
 * Mentions légales, CGV, CGU, politique de confidentialité, DPA and the
 * illicit-content report form — plain server-rendered pages so they stay
 * readable even without JavaScript, as a legal document should.
 */
class LegalController extends Controller
{
    public function __construct(private Catalog $catalog, private Seo $seo)
    {
    }

    public function mentionsLegales(): View
    {
        return $this->page('Mentions légales', 'templates.vitrine.legal.mentions-legales', '/mentions-legales');
    }

    public function cgv(): View
    {
        return $this->page('Conditions générales de vente', 'templates.vitrine.legal.cgv', '/cgv');
    }

    public function cgu(): View
    {
        return $this->page("Conditions générales d'utilisation", 'templates.vitrine.legal.cgu', '/cgu');
    }

    public function confidentialite(): View
    {
        return $this->page('Politique de confidentialité', 'templates.vitrine.legal.confidentialite', '/confidentialite');
    }

    public function dpa(): View
    {
        return $this->page('Accord de sous-traitance (DPA)', 'templates.vitrine.legal.dpa', '/dpa', false);
    }

    public function reportForm(): View
    {
        return $this->page('Signaler un contenu', 'templates.vitrine.legal.signalement', '/signalement');
    }

    public function reportSubmit(Request $request): RedirectResponse
    {
        $data = $request->validate(ContentReport::$validationRules);

        $report = ContentReport::query()->create($data);

        Notification::route('mail', $report->reporter_email)->notify(new ContentReportAcknowledged($report));

        $adminEmail = config('legal.report_email');
        if (filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            Notification::route('mail', $adminEmail)->notify(new ContentReportReceived($report));
        }

        return redirect('/signalement')->with('report_success', true);
    }

    private function page(string $title, string $view, string $path, bool $index = true): View
    {
        return view($view, [
            'title' => $title,
            'seo' => $this->seo->page($title . ' | ' . $this->seo->siteName(), $title . ' — ' . config('app.name'), $path, [], $index),
            'games' => $this->catalog->games(),
        ]);
    }
}
