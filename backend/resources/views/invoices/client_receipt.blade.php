<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111827; }
        h1 { font-size: 20px; margin-bottom: 8px; }
        .meta { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; }
        .totals { margin-top: 16px; }
    </style>
</head>
<body>
<h1>Reçu client</h1>
<div class="meta">
    <p><strong>Organisateur :</strong> {{ $tenant->name }}</p>
    <p><strong>Commande :</strong> #{{ $order->id }}</p>
    <p><strong>Date :</strong> {{ $order->paid_at?->format('d/m/Y H:i') ?? now()->format('d/m/Y H:i') }}</p>
</div>
<table>
    <thead>
    <tr>
        <th>Billet</th>
        <th>Quantité</th>
        <th>Prix unitaire</th>
        <th>Total</th>
    </tr>
    </thead>
    <tbody>
    @foreach($order->items as $item)
        <tr>
            <td>{{ $item->ticket->name }}</td>
            <td>{{ $item->quantity }}</td>
            <td>{{ number_format($item->unit_price_cents / 100, 2, ',', ' ') }} {{ $order->currency }}</td>
            <td>{{ number_format($item->total_price_cents / 100, 2, ',', ' ') }} {{ $order->currency }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
<div class="totals">
    <p><strong>Total payé :</strong> {{ number_format($order->amount_total_cents / 100, 2, ',', ' ') }} {{ $order->currency }}</p>
</div>
<p>Merci pour votre achat !</p>
</body>
</html>
