<?php

namespace Pterodactyl\Notifications;

use Pterodactyl\Models\ContentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Sent to the site's public point of contact so a new illicit-content report
 * never just sits unseen in the admin panel.
 */
class ContentReportReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ContentReport $report)
    {
    }

    public function via($notifiable)
    {
        return [ 'mail' ];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage())
            ->subject('Nouveau signalement de contenu — #' . $this->report->id)
            ->line('Catégorie : ' . $this->report->category)
            ->line('Service concerné : ' . $this->report->target)
            ->line('Signalé par : ' . $this->report->reporter_name . ' (' . $this->report->reporter_email . ')')
            ->line('Description : ' . $this->report->description)
            ->action('Traiter ce signalement', url('/admin/reports'));
    }
}
