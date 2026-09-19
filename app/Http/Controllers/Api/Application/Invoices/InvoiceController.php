<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Invoices;

use Pterodactyl\Models\User;
use Laravel\Cashier\Cashier;
use Illuminate\Http\JsonResponse;
use Stripe\Exception\ExceptionInterface as StripeExceptionInterface;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Invoices\GetInvoicesRequest;

class InvoiceController extends ApplicationApiController
{
    /**
     * Returns the most recent invoices across every customer, straight from
     * Stripe — this panel has no local invoices table, Stripe is the only
     * record. Cursor-paginated (Stripe's own pagination style) rather than
     * page-numbered like the rest of the admin API.
     */
    public function index(GetInvoicesRequest $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', '25');

        try {
            $invoices = Cashier::stripe()->invoices->all([
                'limit' => min(max($perPage, 1), 100),
                'starting_after' => $request->query('starting_after') ?: null,
            ]);
        } catch (StripeExceptionInterface $exception) {
            return response()->json([ 'error' => "La facturation n'est pas encore configurée." ], 503);
        }

        $customers = User::query()
            ->whereIn('stripe_id', collect($invoices->data)->pluck('customer')->filter()->unique()->values())
            ->get()
            ->keyBy('stripe_id');

        return response()->json([
            'data' => collect($invoices->data)->map(function ($invoice) use ($customers) {
                $customer = $customers->get($invoice->customer);

                return [
                    'id' => $invoice->id,
                    'number' => $invoice->number,
                    'date' => date(DATE_ATOM, $invoice->created),
                    'total' => number_format($invoice->total / 100, 2) . ' ' . strtoupper($invoice->currency),
                    'status' => $invoice->status,
                    'customer' => $customer ? [ 'id' => $customer->id, 'username' => $customer->username, 'email' => $customer->email ] : null,
                    'hosted_url' => $invoice->hosted_invoice_url,
                    'pdf_url' => $invoice->invoice_pdf,
                ];
            })->values(),
            'meta' => [
                'has_more' => $invoices->has_more,
                'next_cursor' => $invoices->has_more ? collect($invoices->data)->last()->id ?? null : null,
            ],
        ]);
    }
}
