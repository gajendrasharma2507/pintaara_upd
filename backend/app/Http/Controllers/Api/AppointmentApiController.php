<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentApiController extends Controller
{
    /**
     * Store appointment from storefront form.
     * Can be invoked by guests or logged-in users.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => 'nullable|string|max:255',
            'full_name' => 'nullable|string|max:255',
            'contact' => 'required|string|max:255',
            'date' => 'nullable|string|max:100',
            'time' => 'nullable|string|max:100',
            'purpose' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $fullName = $validated['fullName'] ?? $validated['full_name'] ?? ($request->user()?->name ?? 'Valued Patron');
        $userId = $request->user()?->id;

        $appointment = Appointment::create([
            'user_id' => $userId,
            'full_name' => $fullName,
            'contact' => $validated['contact'],
            'date' => $validated['date'] ?? null,
            'time' => $validated['time'] ?? null,
            'purpose' => $validated['purpose'] ?? 'Fine Jewelry Consultation',
            'notes' => $validated['notes'] ?? null,
            'status' => 'confirmed',
        ]);

        AuditLog::log('appointment_booked', 'Appointment', $appointment->id, null, [
            'user_id' => $userId,
            'full_name' => $fullName,
            'contact' => $validated['contact'],
            'date' => $appointment->date,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Appointment booked successfully. Our atelier concierge will contact you shortly.',
            'data' => $appointment,
        ], 201);
    }

    /**
     * Customer Appointments (IDOR Protected: strictly scoped to authenticated user).
     * Endpoint: GET /api/user/appointments
     */
    public function userAppointments(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $appointments = Appointment::where('user_id', $user->id)
            ->orWhere('contact', $user->email)
            ->orWhere('contact', $user->phone)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $appointments,
        ]);
    }

    /**
     * Admin index of all appointments.
     * Endpoint: GET /api/admin/appointments
     */
    public function index(): JsonResponse
    {
        $appointments = Appointment::orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'count' => $appointments->count(),
            'data' => $appointments,
        ]);
    }

    /**
     * Admin update appointment status (confirmed, completed, cancelled, rescheduled).
     * Endpoint: PUT /api/admin/appointments/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $status = $request->input('status', 'confirmed');
        $oldStatus = $appointment->status;
        $appointment->update(['status' => $status]);

        AuditLog::log('appointment_status_updated', 'Appointment', $appointment->id, ['status' => $oldStatus], ['status' => $status]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $appointment,
        ]);
    }
}
