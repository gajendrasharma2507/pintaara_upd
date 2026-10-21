<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    public function index()
    {
        $settings = [
            'gst_percent' => Setting::get('gst_percent', 3.0),
            'default_wastage_percent' => Setting::get('default_wastage_percent', 0.0),
            'brand_name' => Setting::get('brand_name', 'PINTAARA'),
            'currency_symbol' => Setting::get('currency_symbol', '₹'),
            'contact_email' => Setting::get('contact_email', 'concierge@pintaara.com'),
            'contact_phone' => Setting::get('contact_phone', '+91 98765 43210'),
        ];

        return view('admin.settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'gst_percent' => 'required|numeric|min:0|max:100',
            'default_wastage_percent' => 'nullable|numeric|min:0|max:100',
            'brand_name' => 'required|string|max:255',
            'currency_symbol' => 'required|string|max:10',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        Setting::set('gst_percent', (float) $request->gst_percent, 'number', 'GST % for fine jewelry');
        Setting::set('default_wastage_percent', (float) ($request->default_wastage_percent ?? 0.0), 'number', 'Default wastage %');
        Setting::set('brand_name', $request->brand_name, 'string', 'Brand Name');
        Setting::set('currency_symbol', $request->currency_symbol, 'string', 'Currency symbol');
        Setting::set('contact_email', $request->contact_email, 'string', 'Concierge email');
        Setting::set('contact_phone', $request->contact_phone, 'string', 'Concierge phone');

        return redirect()->back()->with('success', 'Atelier settings updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // If no authenticated user is found (e.g., testing without auth middleware), fallback to first user
        if (!$user) {
            $user = \App\Models\User::first();
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return redirect()->back()->withErrors(['current_password' => 'The provided password does not match your current password.']);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return redirect()->back()->with('success', 'Password updated successfully.');
    }
}
