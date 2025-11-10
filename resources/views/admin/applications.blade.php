<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Applications</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .panel{background:#fff;padding:16px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,.06);text-align:center}
    .name{font-weight:600;margin-bottom:10px}
    .preview-btn{display:inline-block;padding:8px 12px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none}
  </style>
</head>
<body>
  <h1>Councilor Applications</h1>
  <div class="grid">
    @foreach($applications as $app)
      @php $user = \App\Models\User::find($app->user_id); @endphp
      <div class="panel">
        <div class="name">{{ $user ? $user->name : 'Unknown applicant' }}</div>
        <a class="preview-btn" href="{{ route('admin.applications.preview', $app->id) }}">Preview</a>
      </div>
    @endforeach
    @if($applications->isEmpty())
      <p>No applications found.</p>
    @endif
  </div>
</body>
</html>