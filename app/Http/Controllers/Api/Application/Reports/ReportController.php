<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Reports;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\ContentReport;
use Illuminate\Support\Facades\Notification;
use Pterodactyl\Notifications\ContentReportResolved;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;

/**
 * Admin-side handling of illicit-content reports: the LCEN/DSA paper trail
 * (who reported what, and the reasoned response given back) lives here.
 */
class ReportController extends ApplicationApiController
{
    public function index(): JsonResponse
    {
        $reports = ContentReport::query()->with('handler')->orderByDesc('created_at')->get();

        return response()->json([ 'data' => $reports->map(fn (ContentReport $report) => $this->transform($report))->values() ]);
    }

    public function respond(Request $request, ContentReport $report): JsonResponse
    {
        $data = $request->validate([ 'response' => 'required|string|between:1,5000' ]);

        $report->update([
            'status' => ContentReport::STATUS_PROCESSED,
            'admin_response' => $data['response'],
            'handled_by' => $request->user()->id,
            'responded_at' => now(),
        ]);

        Notification::route('mail', $report->reporter_email)->notify(new ContentReportResolved($report));

        return response()->json([ 'data' => $this->transform($report->fresh('handler')) ]);
    }

    private function transform(ContentReport $report): array
    {
        return [
            'id' => $report->id,
            'reporter_name' => $report->reporter_name,
            'reporter_email' => $report->reporter_email,
            'category' => $report->category,
            'target' => $report->target,
            'description' => $report->description,
            'status' => $report->status,
            'admin_response' => $report->admin_response,
            'handled_by' => $report->handler?->username,
            'responded_at' => $report->responded_at?->toIso8601String(),
            'created_at' => $report->created_at->toIso8601String(),
        ];
    }
}
