<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Schema;

class EmailTemplateService
{
    /**
     * Resolve subject and view/body from DB EmailTemplate if active and customized.
     */
    public static function resolve(string $slug, array $vars, string $defaultSubject, string $defaultView, array $defaultData = []): array
    {
        try {
            if (!Schema::hasTable('email_templates')) {
                return [
                    'subject' => $defaultSubject,
                    'view' => $defaultView,
                    'with' => array_merge($defaultData, ['emailSubject' => $defaultSubject]),
                ];
            }

            $tpl = EmailTemplate::where('slug', $slug)->where('is_active', true)->first();
            if ($tpl && trim((string) $tpl->body_html) !== '') {
                $subject = EmailTemplate::replaceVariables((string) $tpl->subject, $vars);
                $bodyHtml = EmailTemplate::replaceVariables((string) $tpl->body_html, $vars);

                return [
                    'subject' => $subject ?: $defaultSubject,
                    'view' => 'emails.custom_raw',
                    'with' => array_merge($defaultData, [
                        'emailSubject' => $subject ?: $defaultSubject,
                        'customBodyHtml' => $bodyHtml,
                    ]),
                ];
            }
        } catch (\Throwable $e) {
            // Fall back safely to default Blade view
        }

        return [
            'subject' => $defaultSubject,
            'view' => $defaultView,
            'with' => array_merge($defaultData, ['emailSubject' => $defaultSubject]),
        ];
    }
}
