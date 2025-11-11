<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Preview</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:20px;background:#f4f6f8}
    .card{background:#fff;padding:18px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.06);max-width:720px;margin:auto}
    .row{margin-bottom:12px}
    .label{font-weight:600;color:#333;display:block;margin-bottom:6px}
    .val{color:#444}
    .actions{margin-top:18px;display:flex;gap:10px;align-items:center}
    .btn{display:inline-block;padding:8px 12px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none}
    .btn-approve{background:#28a745}
    .msg{padding:10px;border-radius:6px;margin-bottom:12px}
    .msg-success{background:#e6ffed;color:#065f2c}
    .msg-error{background:#ffe6e6;color:#7a1b1b}
  </style>
</head>
<body>
  <div class="card">
    <h2>Application Preview</h2>

    @if(session('status'))
      <div class="msg msg-success">{{ session('status') }}</div>
    @endif
    @if(session('error'))
      <div class="msg msg-error">{{ session('error') }}</div>
    @endif

    <div class="row">
      <span class="label">Name</span>
      <div class="val">{{ $user ? $user->name : 'N/A' }}</div>
    </div>

    <div class="row">
      <span class="label">Email</span>
      <div class="val">{{ $user ? $user->email : 'N/A' }}</div>
    </div>

    <div class="row">
      <span class="label">Address</span>
      <div class="val">{{ $user ? $user->address : ($app->address ?? 'N/A') }}</div>
    </div>

    <div class="row">
      <span class="label">Attachment</span>
      @if(!empty($app->attachment_path))
        <div class="val"><a href="{{ asset('storage/'.$app->attachment_path) }}" target="_blank" class="btn">Open attachment</a></div>
      @else
        <div class="val"><em>No attachment uploaded.</em></div>
      @endif
    </div>

    <div class="row">
      <span class="label">Status</span>
      <div class="val">{{ $app->status ?? 'pending' }}</div>
    </div>

    <div class="actions">
      @if($user && !($user->is_approved ?? false))
        <form action="{{ route('admin.applications.approve', $app->id) }}" method="POST" style="display:inline">
          @csrf
          <button type="submit" class="btn btn-approve">Approve</button>
        </form>
      @else
        <div style="color: #2d7a2d; font-weight:600">Already approved</div>
      @endif

      <a href="{{ route('admin.dashboard') }}" class="btn" style="background:#6c757d">Back to dashboard</a>
    </div>
  </div>
</body>
</html>