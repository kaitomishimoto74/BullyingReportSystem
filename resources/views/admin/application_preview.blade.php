<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Preview</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;background:#f4f6f8}.card{background:#fff;padding:18px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.06);max-width:700px;margin:auto} a.btn{display:inline-block;padding:8px 12px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none}</style>
</head>
<body>
  <div class="card">
    <h2>Application Preview</h2>
    <p><strong>Name:</strong> {{ $user ? $user->name : 'N/A' }}</p>
    <p><strong>Email:</strong> {{ $user ? $user->email : 'N/A' }}</p>
    <p><strong>Status:</strong> {{ $app->status ?? 'pending' }}</p>
    @if(!empty($app->attachment_path))
      <p><strong>Attachment:</strong> <a class="btn" href="{{ asset('storage/'.$app->attachment_path) }}" target="_blank">Open</a></p>
    @else
      <p><em>No attachment uploaded.</em></p>
    @endif
    <p style="margin-top:16px"><a href="{{ route('admin.applications') }}">Back to list</a></p>
  </div>
</body>
</html>