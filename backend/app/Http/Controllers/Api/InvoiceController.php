<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
        $this->authorizeResource(Invoice::class, 'invoice');
    }

    public function index(Request $request): JsonResponse
    {
        $this->tenantContext->ensureResolved();

        $invoices = Invoice::query()
            ->when($request->string('type')->isNotEmpty(), fn ($query) => $query->where('type', $request->string('type')))
            ->orderByDesc('issued_at')
            ->paginate(20);

        return response()->json($invoices);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load('order');

        $disk = config('filesystems.default', 'local');
        $storage = Storage::disk($disk);
        $downloadUrl = null;

        if (method_exists($storage, 'temporaryUrl')) {
            try {
                $downloadUrl = $storage->temporaryUrl($invoice->pdf_path, now()->addMinutes(15));
            } catch (\Throwable) {
                $downloadUrl = $storage->url($invoice->pdf_path);
            }
        } elseif (method_exists($storage, 'url')) {
            $downloadUrl = $storage->url($invoice->pdf_path);
        }

        return response()->json([
            'invoice' => $invoice,
            'download_url' => $downloadUrl,
        ]);
    }
}
