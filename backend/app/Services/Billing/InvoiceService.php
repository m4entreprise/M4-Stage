<?php

namespace App\Services\Billing;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceService
{
    public function generateClientInvoice(Order $order): Invoice
    {
        $tenant = $order->tenant;
        $fileName = $this->buildFilename($tenant, $order, 'client');
        $path = "invoices/{$tenant->id}/{$fileName}";

        $pdf = Pdf::loadView('invoices.client_receipt', [
            'order' => $order->loadMissing(['items.ticket', 'tenant', 'event']),
            'tenant' => $tenant,
        ]);

        $disk = config('filesystems.default', 'local');

        Storage::disk($disk)->put($path, $pdf->output());

        return $order->invoices()->create([
            'tenant_id' => $tenant->id,
            'type' => 'client_receipt',
            'number' => $this->generateNumber($tenant),
            'pdf_path' => $path,
            'amount_cents' => $order->amount_total_cents,
            'currency' => $order->currency,
            'issued_at' => now(),
        ]);
    }

    public function generateCommissionInvoice(Order $order): Invoice
    {
        $tenant = $order->tenant;
        $fileName = $this->buildFilename($tenant, $order, 'm4');
        $path = "invoices/platform/{$tenant->id}/{$fileName}";

        $pdf = Pdf::loadView('invoices.m4_commission', [
            'order' => $order->loadMissing(['tenant']),
            'tenant' => $tenant,
        ]);

        $disk = config('filesystems.default', 'local');

        Storage::disk($disk)->put($path, $pdf->output());

        return Invoice::create([
            'tenant_id' => $tenant->id,
            'order_id' => $order->id,
            'type' => 'm4_commission',
            'number' => $this->generateNumber($tenant, prefix: 'M4'),
            'pdf_path' => $path,
            'amount_cents' => $order->application_fee_amount_cents,
            'currency' => $order->currency,
            'issued_at' => now(),
        ]);
    }

    protected function generateNumber(Tenant $tenant, string $prefix = 'INV'): string
    {
        $timestamp = now()->format('YmdHis');

        return sprintf('%s-%s-%s', $prefix, Str::upper($tenant->slug), $timestamp);
    }

    protected function buildFilename(Tenant $tenant, Order $order, string $suffix): string
    {
        return sprintf('%s-%s-%s.pdf', now()->format('YmdHis'), $tenant->slug, $suffix);
    }
}
