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
    </style>
</head>
<body>
<h1>Facture commission M4</h1>
<div class="meta">
    <p><strong>Organisateur :</strong> {{ $tenant->name }}</p>
    <p><strong>Commande :</strong> #{{ $order->id }}</p>
    <p><strong>Date :</strong> {{ now()->format('d/m/Y H:i') }}</p>
    <p><strong>Taux appliqué :</strong> {{ number_format($order->commission_rate_bps / 100, 2, ',', ' ') }} %</p>
</div>
<table>
    <thead>
    <tr>
        <th>Description</th>
        <th>Montant ({{ $order->currency }})</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Commission plateforme M4 sur commande #{{ $order->id }}</td>
        <td>{{ number_format($order->application_fee_amount_cents / 100, 2, ',', ' ') }}</td>
    </tr>
    </tbody>
</table>
<p>Total dû : <strong>{{ number_format($order->application_fee_amount_cents / 100, 2, ',', ' ') }} {{ $order->currency }}</strong></p>
</body>
</html>
