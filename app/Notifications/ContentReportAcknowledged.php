<?php

namespace Pterodactyl\Notifications;

use Pterodactyl\Models\ContentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Sent to the reporter the moment their report is submitted — the
 * "acknowledgement of receipt" required by the DSA (art. 16) and good
 * practice under the LCEN's illicit-content reporting duty.
 */
class ContentReportAcknowledged extends Notification implements ShouldQueue
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
            ->subject('Votre signalement a bien été reçu')
            ->greeting('Bonjour ' . $this->report->reporter_name . ',')
            ->line('Nous avons bien reçu votre signalement concernant : ' . $this->report->target)
            ->line('Notre équipe va l’examiner et vous répondra par email dès que possible.')
            ->line('Référence du signalement : #' . $this->report->id);
    }
}
