<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Stripe\Exception\ExceptionInterface as StripeExceptionInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Pterodactyl\Http\Requests\Api\Client\AccountApiRequest;

class BillingController extends ClientApiController
{
    /**
     * Returns the invoices Stripe has generated for the authenticated user's
     * subscriptions. Invoices are Stripe's own records — this panel never
     * stores or generates them itself.
     */
    public function index(AccountApiRequest $request): JsonResponse
    {
        if (empty($request->user()->stripe_id)) {
            return response()->json([ 'data' => [] ]);
        }

        try {
            $invoices = $request->user()->invoices();
        } catch (StripeExceptionInterface $exception) {
            return response()->json([ 'error' => "La facturation n'est pas encore configurée." ], 503);
        }

        return response()->json([
            'data' => $invoices->map(fn ($invoice) => [
                'id' => $invoice->id,
                'number' => $invoice->asStripeInvoice()->number,
                'date' => $invoice->date()->toIso8601String(),
                'total' => $invoice->total(),
                'status' => $invoice->asStripeInvoice()->status,
                'hosted_url' => $invoice->asStripeInvoice()->hosted_invoice_url,
                'pdf_url' => $invoice->asStripeInvoice()->invoice_pdf,
            ])->values(),
        ]);
    }

    /**
     * Redirects to the Stripe-hosted PDF for one of the authenticated user's
     * invoices. findInvoiceOrFail() guarantees the invoice actually belongs
     * to this user before returning it.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    public function show(AccountApiRequest $request, string $invoice): RedirectResponse
    {
        $invoice = $request->user()->findInvoiceOrFail($invoice);

        return redirect($invoice->asStripeInvoice()->invoice_pdf);
    }
}
