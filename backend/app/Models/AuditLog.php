<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';

    protected $fillable = [
        'user_id',
        'action',
        'entity',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record an audit event securely without logging secrets or credentials.
     */
    public static function log(
        string $action,
        ?string $entity = null,
        mixed $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null
    ): self {
        // Redact any sensitive keys
        $redactedKeys = ['password', 'otp', 'token', 'secret', 'key_secret', 'pin', 'card'];
        $clean = function (?array $arr) use ($redactedKeys) {
            if (!$arr) return null;
            $res = [];
            foreach ($arr as $k => $v) {
                $lower = strtolower($k);
                $isRedacted = false;
                foreach ($redactedKeys as $rk) {
                    if (str_contains($lower, $rk)) {
                        $isRedacted = true;
                        break;
                    }
                }
                $res[$k] = $isRedacted ? '[REDACTED]' : $v;
            }
            return $res;
        };

        return static::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId !== null ? (string) $entityId : null,
            'old_values' => $clean($oldValues),
            'new_values' => $clean($newValues),
            'ip_address' => request()->ip(),
            'user_agent' => substr(request()->userAgent() ?? '', 0, 255),
        ]);
    }
}
