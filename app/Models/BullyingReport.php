<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BullyingReport extends Model
{
    protected $fillable = [
        'ticket_id',
        'date',
        'reporter_name',
        'reporter_phone',
        'reporter_email',
        'reporter_type',
        'victim_names',
        'offender_names',
        'offender_age',
        'offender_is_student',
        'bullying_type',
        'bullying_explanation',
        'bullying_location',
        'bullying_location_other',
        'victim_spoken_to',
        'status'
    ];
}
