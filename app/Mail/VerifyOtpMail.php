<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $expiresMinutes;

    public function __construct(string $otp, int $expiresMinutes = 15)
    {
        $this->otp = $otp;
        $this->expiresMinutes = $expiresMinutes;
    }

    public function build()
    {
        return $this->subject('Your verification code')
                    ->view('emails.verify_otp')
                    ->with(['otp' => $this->otp, 'minutes' => $this->expiresMinutes]);
    }
}