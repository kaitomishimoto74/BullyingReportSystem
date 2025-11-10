<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CouncilorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'attachment_path',
        'status',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}