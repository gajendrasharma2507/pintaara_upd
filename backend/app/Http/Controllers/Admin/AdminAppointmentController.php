<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CustomTemplateMail;
use App\Models\AuditLog;
use App\Models\Appointment;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminAppointmentController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $query = Appointment::with('user')->orderByDesc('created_at');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $appointments = $query->paginate(20);

        return view('admin.appointments.index', compact('appointments', 'status'));
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::with('user')->findOrFail($id);

        $validated = $request->validate([
            'date'       => 'nullable|string|max:100',
            'time'       => 'required|string|max:100',
            'status'     => 'required|in:pending,confirmed,rescheduled,completed,cancelled',
            'notes'      => 'nullable|string|max:2000',
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $oldData = [
            'date'   => $appointment->date,
            'time'   => $appointment->time,
            'status' => $appointment->status,
        ];

        $appointment->update([
            'date'   => $validated['date'] ?? $appointment->date,
            'time'   => $validated['time'],
            'status' => $validated['status'],
            'notes'  => $validated['notes'] ?? $appointment->notes,
        ]);

        AuditLog::log('appointment_updated_by_admin', 'Appointment', $appointment->id, $oldData, [
            'date'   => $appointment->date,
            'time'   => $appointment->time,
            'status' => $appointment->status,
        ]);

        // Send email notification to the client if email is available
        $emailSent = false;
        $recipient = $appointment->resolveCustomerEmail();
        if ($recipient && $request->boolean('notify_user', true)) {
            try {
                EmailTemplate::ensureDefaultsExist();
                $tpl = EmailTemplate::where('slug', 'appointment_updated')->where('is_active', true)->first();
                if ($tpl) {
                    $vars = [
                        'customer_name'       => $appointment->full_name ?: 'Valued Client',
                        'customer_email'      => $recipient,
                        'appointment_date'    => $appointment->date ?: 'To be confirmed',
                        'appointment_time'    => $appointment->time ?: 'To be confirmed',
                        'appointment_status'  => ucfirst($appointment->status),
                        'appointment_purpose' => $appointment->purpose ?: 'Studio Consultation',
                        'admin_note'          => !empty($validated['admin_note']) ? ('<strong>Note:</strong> ' . e($validated['admin_note'])) : '',
                        'action_url'          => config('app.frontend_url', 'https://pintaara.com') . '/book-an-appointment',
                    ];
                    Mail::to($recipient)->send(new CustomTemplateMail($tpl, $vars));
                    $emailSent = true;
                }
            } catch (\Throwable $e) {
                Log::error('[AdminAppointmentController] Failed to send appointment update email: ' . $e->getMessage());
            }
        }

        $msg = 'Appointment #' . $appointment->id . ' updated.';
        if ($emailSent) {
            $msg .= ' Notification email sent to ' . $recipient . '.';
        } elseif (!$recipient) {
            $msg .= ' (No email address on file for this booking.)';
        }

        return redirect()->route('admin.appointments')->with('success', $msg);
    }
}
