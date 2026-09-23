<?php

namespace Pterodactyl\Notifications;

use Pterodactyl\Models\ContentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * The reasoned response to the reporter once an admin has processed their
 * report — required by the DSA alongside the acknowledgement of receipt.
 */
class ContentReportResolved extends Notification implements ShouldQueue
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
            ->subject('Réponse à votre signalement #' . $this->report->id)
            ->greeting('Bonjour ' . $this->report->reporter_name . ',')
            ->line('Voici notre réponse à votre signalement concernant : ' . $this->report->target)
            ->line($this->report->admin_response ?? '');
    }
}
