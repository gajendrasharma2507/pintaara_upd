<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CustomTemplateMail;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AdminEmailTemplateController extends Controller
{
    public function index(Request $request)
    {
        EmailTemplate::ensureDefaultsExist();

        $category = $request->get('category', 'all');
        $query = EmailTemplate::orderBy('is_system', 'desc')
            ->orderBy('category', 'asc')
            ->orderBy('name', 'asc');

        if ($category !== 'all') {
            $query->where('category', $category);
        }

        $templates = $query->get();

        return view('admin.email-templates.index', compact('templates', 'category'));
    }

    public function create()
    {
        $template = new EmailTemplate([
            'category' => 'custom',
            'is_active' => true,
            'is_system' => false,
            'variables_hint' => 'customer_name, customer_email, action_url',
            'body_html' => "<h2 class=\"h1-title\">Hello {{customer_name}},</h2>\n<p>Write your email message here.</p>\n<div class=\"btn-container\"><a href=\"{{action_url}}\" class=\"btn-primary\">LEARN MORE</a></div>",
        ]);

        return view('admin.email-templates.form', compact('template'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'nullable|string|max:120|unique:email_templates,slug',
            'category'       => 'required|in:auth,orders,custom',
            'subject'        => 'required|string|max:255',
            'body_html'      => 'required|string',
            'variables_hint' => 'nullable|string|max:500',
        ]);

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'], '_')
            : Str::slug($validated['name'], '_');

        // Ensure unique slug
        $baseSlug = $slug;
        $counter = 1;
        while (EmailTemplate::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '_' . $counter++;
        }

        $tpl = EmailTemplate::create([
            'name'           => $validated['name'],
            'slug'           => $slug,
            'category'       => $validated['category'],
            'subject'        => $validated['subject'],
            'body_html'      => $validated['body_html'],
            'variables_hint' => $validated['variables_hint'] ?? null,
            'is_system'      => false,
            'is_active'      => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.email-templates.edit', $tpl->id)
            ->with('success', 'Email template "' . $tpl->name . '" created successfully.');
    }

    public function edit($id)
    {
        $template = EmailTemplate::findOrFail($id);
        return view('admin.email-templates.form', compact('template'));
    }

    public function update(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category'       => 'required|in:auth,orders,custom',
            'subject'        => 'required|string|max:255',
            'body_html'      => 'required|string',
            'variables_hint' => 'nullable|string|max:500',
        ]);

        $template->update([
            'name'           => $validated['name'],
            'category'       => $template->is_system ? $template->category : $validated['category'],
            'subject'        => $validated['subject'],
            'body_html'      => $validated['body_html'],
            'variables_hint' => $validated['variables_hint'] ?? $template->variables_hint,
            'is_active'      => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.email-templates.edit', $template->id)
            ->with('success', 'Email template "' . $template->name . '" updated successfully.');
    }

    public function destroy($id)
    {
        $template = EmailTemplate::findOrFail($id);
        if ($template->is_system) {
            return redirect()->route('admin.email-templates')
                ->with('error', 'System email templates cannot be deleted. You can edit or deactivate them.');
        }

        $name = $template->name;
        $template->delete();

        return redirect()->route('admin.email-templates')
            ->with('success', 'Email template "' . $name . '" deleted.');
    }

    public function preview(Request $request)
    {
        $subject = (string) $request->input('subject', 'PINTAARA Preview');
        $bodyHtml = (string) $request->input('body_html', '');

        $sampleVars = self::sampleVariables();
        $resolvedSubject = EmailTemplate::replaceVariables($subject, $sampleVars);
        $resolvedBody = EmailTemplate::replaceVariables($bodyHtml, $sampleVars);

        return view('emails.custom_raw', [
            'emailSubject' => $resolvedSubject,
            'customBodyHtml' => $resolvedBody,
        ]);
    }

    public function sendTest(Request $request, $id)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        $template = EmailTemplate::findOrFail($id);

        try {
            Mail::to($request->input('test_email'))
                ->send(new CustomTemplateMail($template, self::sampleVariables()));

            return back()->with('success', 'Test email sent to ' . $request->input('test_email'));
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to send test email: ' . $e->getMessage());
        }
    }

    private static function sampleVariables(): array
    {
        return [
            'customer_name'      => 'Aarav Mehta',
            'customer_email'     => 'client@pintaara.com',
            'order_number'       => 'PNT-2026-0042',
            'total_amount'       => '₹ 42,500',
            'refund_amount'      => '₹ 42,500',
            'otp'                => '482910',
            'expires_minutes'    => '10',
            'courier_name'       => 'Sequel Logistics',
            'tracking_number'    => 'SQL99887766',
            'estimated_delivery' => '3-5 Business Days',
            'delay_reason'       => 'Additional hallmarking quality inspection in progress.',
            'new_estimate'       => '28 Nov, 2026',
            'cancel_reason'      => 'Cancelled at customer request.',
            'action_url'         => config('app.frontend_url', 'https://pintaara.com') . '/account',
        ];
    }
}
