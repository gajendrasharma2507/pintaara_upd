<?php

namespace App\Console\Commands;

use App\Mail\CustomTemplateMail;
use App\Models\Appointment;
use App\Models\EmailTemplate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAppointmentRemindersCommand extends Command
{
    protected $signature = 'appointments:send-reminders';

    protected $description = 'Send 1-hour and 15-minute reminder emails with Google Meet link button to client and admin';

    public function handle(): int
    {
        EmailTemplate::ensureDefaultsExist();
        $tpl = EmailTemplate::where('slug', 'appointment_reminder')->where('is_active', true)->first();
        if (!$tpl) {
            return self::SUCCESS;
        }

        $now = now('Asia/Kolkata');
        $appointments = Appointment::with('user')
            ->whereIn('status', ['pending', 'confirmed', 'rescheduled'])
            ->where(function ($q) {
                $q->whereNull('reminder_1h_sent_at')
                  ->orWhereNull('reminder_15m_sent_at');
            })
            ->get();

        $sentCount = 0;

        foreach ($appointments as $appointment) {
            $scheduledAt = $appointment->parseScheduledAt();
            if (!$scheduledAt) {
                continue;
            }

            $minutesUntil = $now->diffInMinutes($scheduledAt, false);

            // Skip appointments already more than 5 minutes in the past
            if ($minutesUntil < -5) {
                continue;
            }

            $windowLabel = null;
            $columnToMark = null;

            if ($appointment->reminder_1h_sent_at === null && $minutesUntil <= 60 && $minutesUntil > 15) {
                $windowLabel = '1 hour';
                $columnToMark = 'reminder_1h_sent_at';
            } elseif ($appointment->reminder_15m_sent_at === null && $minutesUntil <= 15 && $minutesUntil >= -5) {
                $windowLabel = '15 minutes';
                $columnToMark = 'reminder_15m_sent_at';
            }

            if (!$windowLabel || !$columnToMark) {
                continue;
            }

            $meetingUrl = $appointment->getMeetingUrl();
            $recipient = $appointment->resolveCustomerEmail();
            $vars = [
                'customer_name'       => $appointment->full_name ?: 'Valued Client',
                'customer_email'      => $recipient ?: '',
                'reminder_window'     => $windowLabel,
                'appointment_date'    => $appointment->date ?: '',
                'appointment_time'    => $appointment->time ?: '',
                'appointment_purpose' => $appointment->purpose ?: 'Studio Consultation',
                'booking_url'         => $meetingUrl,
                'action_url'          => $meetingUrl,
            ];

            try {
                $mailTpl = clone $tpl;
                if (!str_contains((string) $mailTpl->body_html, '{{booking_url}}')) {
                    $mailTpl->body_html .= '<div class="btn-container"><a href="' . e($meetingUrl) . '" class="btn-primary">JOIN MEETING</a></div>';
                }

                if ($recipient) {
                    Mail::to($recipient)->send(new CustomTemplateMail($mailTpl, $vars));
                }

                $studioEmail = 'info@pintaara.com';
                if (strtolower((string) $recipient) !== $studioEmail) {
                    Mail::to($studioEmail)->send(new CustomTemplateMail($mailTpl, $vars));
                }

                $appointment->update([$columnToMark => now()]);
                $sentCount++;
            } catch (\Throwable $e) {
                Log::warning("[SendAppointmentReminders] Appointment #{$appointment->id} reminder failed: " . $e->getMessage());
            }
        }

        $this->info("Appointment reminders processed. Sent: {$sentCount}");
        return self::SUCCESS;
    }
}
