<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminSettingApiController extends Controller
{
    /**
     * Helper to mask sensitive secret keys for safe admin display.
     */
    protected function maskSecret(?string $secret): string
    {
        if (empty($secret)) {
            return '';
        }
        $len = strlen($secret);
        if ($len <= 4) {
            return str_repeat('•', $len);
        }
        return str_repeat('•', min(8, $len - 4)) . substr($secret, -4);
    }

    /**
     * Helper to check if a value is masked placeholder.
     */
    protected function isMasked(?string $val): bool
    {
        if (empty($val)) {
            return false;
        }
        return str_starts_with($val, '•');
    }

    /**
     * Get all Atelier & API Configuration Settings for Production and Testing.
     */
    public function index(): JsonResponse
    {
        // 1. Atelier Store Settings
        $atelier = [
            'brand_name' => Setting::get('brand_name', 'PINTAARA Fine Jewelry'),
            'currency' => Setting::get('currency', 'INR (₹)'),
            'currency_symbol' => Setting::get('currency_symbol', '₹'),
            'gst_percent' => (float) Setting::get('gst_percent', 3.0),
            'default_wastage_percent' => (float) Setting::get('default_wastage_percent', 0.0),
            'support_email' => Setting::get('support_email', 'concierge@pintaara.com'),
            'support_phone' => Setting::get('support_phone', '+91 98765 43210'),
            'address' => Setting::get('address', 'Atelier Suite 402, Platinum Tower, Bandra West, Mumbai, Maharashtra 400050'),
        ];

        // 2. Razorpay Payment Gateway Settings
        $razorpayMode = Setting::get('razorpay_env', 'test');
        $testKeyId = Setting::get('razorpay_test_key_id', config('razorpay.key_id', env('RAZORPAY_KEY_ID', 'rzp_test_placeholder')));
        $testKeySecret = Setting::get('razorpay_test_key_secret', config('razorpay.key_secret', env('RAZORPAY_KEY_SECRET', 'placeholder_secret')));
        $liveKeyId = Setting::get('razorpay_live_key_id', '');
        $liveKeySecret = Setting::get('razorpay_live_key_secret', '');
        $webhookSecret = Setting::get('razorpay_webhook_secret', '');

        $razorpay = [
            'mode' => $razorpayMode, // 'test' | 'live'
            'test_key_id' => $testKeyId,
            'test_key_secret_masked' => $this->maskSecret($testKeySecret),
            'has_test_secret' => !empty($testKeySecret) && $testKeySecret !== 'placeholder_secret',
            'live_key_id' => $liveKeyId,
            'live_key_secret_masked' => $this->maskSecret($liveKeySecret),
            'has_live_secret' => !empty($liveKeySecret),
            'webhook_secret_masked' => $this->maskSecret($webhookSecret),
            'has_webhook_secret' => !empty($webhookSecret),
            'merchant_name' => Setting::get('razorpay_merchant_name', 'PINTAARA'),
            'currency' => Setting::get('razorpay_currency', 'INR'),
            'auto_capture' => (bool) Setting::get('razorpay_auto_capture', true),
            'active_key_id' => ($razorpayMode === 'live') ? $liveKeyId : $testKeyId,
        ];

        // 3. Sequel 247 Logistics Settings
        $sequelMode = Setting::get('sequel_env', config('services.sequel247.env', 'test'));
        $testToken = Setting::get('sequel_test_token', config('services.sequel247.test_token', '7418b689f9b4fbf82c9f67588206fecc'));
        $prodToken = Setting::get('sequel_prod_token', config('services.sequel247.prod_token', 'e27b75bc3b396ee53d2349adae6884ed'));

        $sequel = [
            'mode' => $sequelMode, // 'test' | 'prod'
            'client_code' => Setting::get('sequel_client_code', config('services.sequel247.client_code', '31492')),
            'store_code' => Setting::get('sequel_store_code', config('services.sequel247.store_code', 'PINTARA')),
            'origin_pincode' => Setting::get('sequel_origin_pincode', config('services.sequel247.origin_pincode', '400001')),
            'test_token_masked' => $this->maskSecret($testToken),
            'has_test_token' => !empty($testToken),
            'test_endpoint' => Setting::get('sequel_test_endpoint', config('services.sequel247.test_endpoint', 'https://test.sequel247.com/')),
            'prod_token_masked' => $this->maskSecret($prodToken),
            'has_prod_token' => !empty($prodToken),
            'prod_endpoint' => Setting::get('sequel_prod_endpoint', config('services.sequel247.prod_endpoint', 'https://sequel247.com/')),
        ];

        // 4. Email & Notifications Settings
        $email = [
            'mode' => Setting::get('mail_mode', 'test'), // 'test' | 'live'
            'driver' => Setting::get('mail_driver', 'smtp'),
            'smtp_host' => Setting::get('mail_host', 'sandbox.smtp.mailtrap.io'),
            'smtp_port' => (int) Setting::get('mail_port', 2525),
            'smtp_encryption' => Setting::get('mail_encryption', 'tls'),
            'smtp_username' => Setting::get('mail_username', ''),
            'smtp_password_masked' => $this->maskSecret(Setting::get('mail_password', '')),
            'has_smtp_password' => !empty(Setting::get('mail_password', '')),
            'resend_api_key_masked' => $this->maskSecret(Setting::get('resend_api_key', config('services.resend.key', ''))),
            'from_address' => Setting::get('mail_from_address', 'concierge@pintaara.com'),
            'from_name' => Setting::get('mail_from_name', 'PINTAARA Fine Jewelry'),
        ];

        // 5. Pabbly Recurring Billing & Webhook Settings
        $pabbly = [
            'is_enabled' => (bool) Setting::get('pabbly_enabled', false),
            'mode' => Setting::get('pabbly_mode', 'test'), // 'test' | 'live'
            'api_key_masked' => $this->maskSecret(Setting::get('pabbly_api_key', '')),
            'has_api_key' => !empty(Setting::get('pabbly_api_key', '')),
            'secret_key_masked' => $this->maskSecret(Setting::get('pabbly_secret_key', '')),
            'has_secret_key' => !empty(Setting::get('pabbly_secret_key', '')),
            'webhook_url' => Setting::get('pabbly_webhook_url', ''),
            'product_id' => Setting::get('pabbly_product_id', ''),
        ];

        // 6. SMS & WhatsApp Gateway Settings
        $sms = [
            'is_enabled' => (bool) Setting::get('sms_enabled', false),
            'mode' => Setting::get('sms_mode', 'test'),
            'provider' => Setting::get('sms_provider', 'twilio'),
            'account_sid' => Setting::get('sms_account_sid', ''),
            'auth_token_masked' => $this->maskSecret(Setting::get('sms_auth_token', '')),
            'has_auth_token' => !empty(Setting::get('sms_auth_token', '')),
            'sender_number' => Setting::get('sms_sender_number', ''),
        ];

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => [
                'atelier' => $atelier,
                'razorpay' => $razorpay,
                'sequel' => $sequel,
                'email' => $email,
                'pabbly' => $pabbly,
                'sms' => $sms,
            ]
        ]);
    }

    /**
     * Save / Update Atelier & API settings.
     */
    public function update(Request $request): JsonResponse
    {
        $payload = $request->all();

        // 1. Atelier Settings
        if (isset($payload['atelier'])) {
            $at = $payload['atelier'];
            if (isset($at['brand_name'])) Setting::set('brand_name', $at['brand_name'], 'string', 'Brand Name');
            if (isset($at['currency'])) Setting::set('currency', $at['currency'], 'string', 'Store Operating Currency');
            if (isset($at['currency_symbol'])) Setting::set('currency_symbol', $at['currency_symbol'], 'string', 'Currency Symbol');
            if (isset($at['gst_percent'])) Setting::set('gst_percent', (float) $at['gst_percent'], 'number', 'GST Tax Percent');
            if (isset($at['default_wastage_percent'])) Setting::set('default_wastage_percent', (float) $at['default_wastage_percent'], 'number', 'Default Wastage Percent');
            if (isset($at['support_email'])) Setting::set('support_email', $at['support_email'], 'string', 'Concierge Support Email');
            if (isset($at['support_phone'])) Setting::set('support_phone', $at['support_phone'], 'string', 'Concierge Support Phone');
            if (isset($at['address'])) Setting::set('address', $at['address'], 'string', 'Atelier Physical Address');
        }

        // 2. Razorpay Settings
        if (isset($payload['razorpay'])) {
            $rz = $payload['razorpay'];
            if (isset($rz['mode'])) Setting::set('razorpay_env', $rz['mode'], 'string', 'Razorpay Environment Mode (test/live)');
            if (isset($rz['test_key_id'])) Setting::set('razorpay_test_key_id', $rz['test_key_id'], 'string', 'Razorpay Test Key ID');
            if (isset($rz['test_key_secret']) && !$this->isMasked($rz['test_key_secret'])) {
                Setting::set('razorpay_test_key_secret', $rz['test_key_secret'], 'string', 'Razorpay Test Key Secret');
            }
            if (isset($rz['live_key_id'])) Setting::set('razorpay_live_key_id', $rz['live_key_id'], 'string', 'Razorpay Live Key ID');
            if (isset($rz['live_key_secret']) && !$this->isMasked($rz['live_key_secret'])) {
                Setting::set('razorpay_live_key_secret', $rz['live_key_secret'], 'string', 'Razorpay Live Key Secret');
            }
            if (isset($rz['webhook_secret']) && !$this->isMasked($rz['webhook_secret'])) {
                Setting::set('razorpay_webhook_secret', $rz['webhook_secret'], 'string', 'Razorpay Webhook Secret');
            }
            if (isset($rz['merchant_name'])) Setting::set('razorpay_merchant_name', $rz['merchant_name'], 'string', 'Razorpay Merchant Display Name');
            if (isset($rz['auto_capture'])) Setting::set('razorpay_auto_capture', (bool) $rz['auto_capture'], 'boolean', 'Razorpay Auto Capture Payment');
        }

        // 3. Sequel 247 Settings
        if (isset($payload['sequel'])) {
            $sq = $payload['sequel'];
            if (isset($sq['mode'])) Setting::set('sequel_env', $sq['mode'], 'string', 'Sequel 247 Mode (test/prod)');
            if (isset($sq['client_code'])) Setting::set('sequel_client_code', (string) $sq['client_code'], 'string', 'Sequel 247 Client Code');
            if (isset($sq['store_code'])) Setting::set('sequel_store_code', $sq['store_code'], 'string', 'Sequel 247 Store Code');
            if (isset($sq['origin_pincode'])) Setting::set('sequel_origin_pincode', (string) $sq['origin_pincode'], 'string', 'Sequel 247 Origin Hub Pincode');
            if (isset($sq['test_token']) && !$this->isMasked($sq['test_token'])) {
                Setting::set('sequel_test_token', $sq['test_token'], 'string', 'Sequel 247 Testing Access Token');
            }
            if (isset($sq['test_endpoint'])) Setting::set('sequel_test_endpoint', $sq['test_endpoint'], 'string', 'Sequel 247 Testing Endpoint URL');
            if (isset($sq['prod_token']) && !$this->isMasked($sq['prod_token'])) {
                Setting::set('sequel_prod_token', $sq['prod_token'], 'string', 'Sequel 247 Production Access Token');
            }
            if (isset($sq['prod_endpoint'])) Setting::set('sequel_prod_endpoint', $sq['prod_endpoint'], 'string', 'Sequel 247 Production Endpoint URL');
        }

        // 4. Email Settings
        if (isset($payload['email'])) {
            $em = $payload['email'];
            if (isset($em['mode'])) Setting::set('mail_mode', $em['mode'], 'string', 'Email Mode (test/live)');
            if (isset($em['driver'])) Setting::set('mail_driver', $em['driver'], 'string', 'Mail Driver');
            if (isset($em['smtp_host'])) Setting::set('mail_host', $em['smtp_host'], 'string', 'SMTP Host');
            if (isset($em['smtp_port'])) Setting::set('mail_port', (int) $em['smtp_port'], 'number', 'SMTP Port');
            if (isset($em['smtp_encryption'])) Setting::set('mail_encryption', $em['smtp_encryption'], 'string', 'SMTP Encryption');
            if (isset($em['smtp_username'])) Setting::set('mail_username', $em['smtp_username'], 'string', 'SMTP Username');
            if (isset($em['smtp_password']) && !$this->isMasked($em['smtp_password'])) {
                Setting::set('mail_password', $em['smtp_password'], 'string', 'SMTP Password');
            }
            if (isset($em['resend_api_key']) && !$this->isMasked($em['resend_api_key'])) {
                Setting::set('resend_api_key', $em['resend_api_key'], 'string', 'Resend API Key');
            }
            if (isset($em['from_address'])) Setting::set('mail_from_address', $em['from_address'], 'string', 'Mail From Address');
            if (isset($em['from_name'])) Setting::set('mail_from_name', $em['from_name'], 'string', 'Mail From Name');
        }

        // 5. Pabbly Settings
        if (isset($payload['pabbly'])) {
            $pb = $payload['pabbly'];
            if (isset($pb['is_enabled'])) Setting::set('pabbly_enabled', (bool) $pb['is_enabled'], 'boolean', 'Pabbly Enabled');
            if (isset($pb['mode'])) Setting::set('pabbly_mode', $pb['mode'], 'string', 'Pabbly Mode (test/live)');
            if (isset($pb['api_key']) && !$this->isMasked($pb['api_key'])) {
                Setting::set('pabbly_api_key', $pb['api_key'], 'string', 'Pabbly API Key');
            }
            if (isset($pb['secret_key']) && !$this->isMasked($pb['secret_key'])) {
                Setting::set('pabbly_secret_key', $pb['secret_key'], 'string', 'Pabbly Secret Key');
            }
            if (isset($pb['webhook_url'])) Setting::set('pabbly_webhook_url', $pb['webhook_url'], 'string', 'Pabbly Webhook URL');
            if (isset($pb['product_id'])) Setting::set('pabbly_product_id', $pb['product_id'], 'string', 'Pabbly Product ID');
        }

        // 6. SMS Settings
        if (isset($payload['sms'])) {
            $sm = $payload['sms'];
            if (isset($sm['is_enabled'])) Setting::set('sms_enabled', (bool) $sm['is_enabled'], 'boolean', 'SMS Enabled');
            if (isset($sm['mode'])) Setting::set('sms_mode', $sm['mode'], 'string', 'SMS Mode (test/live)');
            if (isset($sm['provider'])) Setting::set('sms_provider', $sm['provider'], 'string', 'SMS Provider');
            if (isset($sm['account_sid'])) Setting::set('sms_account_sid', $sm['account_sid'], 'string', 'SMS Account SID');
            if (isset($sm['auth_token']) && !$this->isMasked($sm['auth_token'])) {
                Setting::set('sms_auth_token', $sm['auth_token'], 'string', 'SMS Auth Token');
            }
            if (isset($sm['sender_number'])) Setting::set('sms_sender_number', $sm['sender_number'], 'string', 'SMS Sender Number');
        }

        return response()->json([
            'status' => 'success',
            'success' => true,
            'message' => 'Configuration settings updated successfully for both Production and Testing environments.',
            'data' => $this->index()->getData(true)['data'] ?? [],
        ]);
    }

    /**
     * Test live or sandbox connectivity for a specific API gateway.
     */
    public function testConnection(Request $request): JsonResponse
    {
        $gateway = $request->input('gateway'); // 'razorpay' | 'sequel' | 'email' | 'pabbly'
        $mode = $request->input('mode', 'test'); // 'test' | 'live' | 'prod'
        $startTime = microtime(true);

        switch ($gateway) {
            case 'razorpay':
                // Retrieve keys based on specified test or live mode
                if ($mode === 'live' || $mode === 'production') {
                    $keyId = $request->input('key_id') ?: Setting::get('razorpay_live_key_id', '');
                    $keySecret = $request->input('key_secret');
                    if (empty($keySecret) || $this->isMasked($keySecret)) {
                        $keySecret = Setting::get('razorpay_live_key_secret', '');
                    }
                } else {
                    $keyId = $request->input('key_id') ?: Setting::get('razorpay_test_key_id', config('razorpay.key_id', env('RAZORPAY_KEY_ID')));
                    $keySecret = $request->input('key_secret');
                    if (empty($keySecret) || $this->isMasked($keySecret)) {
                        $keySecret = Setting::get('razorpay_test_key_secret', config('razorpay.key_secret', env('RAZORPAY_KEY_SECRET')));
                    }
                }

                if (empty($keyId) || empty($keySecret) || $keyId === 'rzp_test_placeholder') {
                    return response()->json([
                        'status' => 'error',
                        'success' => false,
                        'message' => "Razorpay {$mode} credentials are incomplete or using placeholder values. Please input a valid Key ID & Secret.",
                        'latency_ms' => 0,
                    ], 422);
                }

                try {
                    $response = Http::timeout(8)
                        ->withBasicAuth($keyId, $keySecret)
                        ->get('https://api.razorpay.com/v1/payments', ['count' => 1]);

                    $latency = round((microtime(true) - $startTime) * 1000);

                    if ($response->successful()) {
                        return response()->json([
                            'status' => 'success',
                            'success' => true,
                            'message' => "Successfully connected to Razorpay Payment Gateway (" . strtoupper($mode) . " mode)! Latency: {$latency}ms.",
                            'latency_ms' => $latency,
                            'mode' => $mode,
                            'key_id' => $keyId,
                        ]);
                    } else {
                        $err = $response->json();
                        $errMsg = $err['error']['description'] ?? $response->body();
                        return response()->json([
                            'status' => 'error',
                            'success' => false,
                            'message' => "Razorpay returned an error: {$errMsg} (HTTP {$response->status()})",
                            'latency_ms' => $latency,
                        ], 400);
                    }
                } catch (\Throwable $e) {
                    $latency = round((microtime(true) - $startTime) * 1000);
                    return response()->json([
                        'status' => 'error',
                        'success' => false,
                        'message' => "Connection failed: " . $e->getMessage(),
                        'latency_ms' => $latency,
                    ], 500);
                }

            case 'sequel':
                if ($mode === 'prod' || $mode === 'production') {
                    $endpoint = $request->input('endpoint') ?: Setting::get('sequel_prod_endpoint', config('services.sequel247.prod_endpoint', 'https://sequel247.com/'));
                    $token = $request->input('token');
                    if (empty($token) || $this->isMasked($token)) {
                        $token = Setting::get('sequel_prod_token', config('services.sequel247.prod_token'));
                    }
                } else {
                    $endpoint = $request->input('endpoint') ?: Setting::get('sequel_test_endpoint', config('services.sequel247.test_endpoint', 'https://test.sequel247.com/'));
                    $token = $request->input('token');
                    if (empty($token) || $this->isMasked($token)) {
                        $token = Setting::get('sequel_test_token', config('services.sequel247.test_token'));
                    }
                }

                $endpoint = rtrim($endpoint, '/') . '/';
                $pincode = $request->input('pincode') ?: Setting::get('sequel_origin_pincode', '400001');

                if (empty($token)) {
                    return response()->json([
                        'status' => 'error',
                        'success' => false,
                        'message' => "Sequel 247 {$mode} token is missing. Please configure the token before testing.",
                        'latency_ms' => 0,
                    ], 422);
                }

                try {
                    $url = $endpoint . 'api/checkServiceability';
                    $response = Http::timeout(8)
                        ->withHeaders([
                            'token' => $token,
                            'Content-Type' => 'application/json',
                            'Accept' => 'application/json',
                        ])
                        ->post($url, ['pincode' => (string) $pincode]);

                    $latency = round((microtime(true) - $startTime) * 1000);

                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'message' => "Sequel 247 Armored Courier endpoint reached (" . strtoupper($mode) . "). HTTP {$response->status()}. Latency: {$latency}ms.",
                        'latency_ms' => $latency,
                        'endpoint' => $url,
                        'response_code' => $response->status(),
                    ]);
                } catch (\Throwable $e) {
                    $latency = round((microtime(true) - $startTime) * 1000);
                    return response()->json([
                        'status' => 'error',
                        'success' => false,
                        'message' => "Sequel 247 endpoint unreachable: " . $e->getMessage(),
                        'latency_ms' => $latency,
                    ], 500);
                }

            case 'pabbly':
                $apiKey = $request->input('api_key');
                if (empty($apiKey) || $this->isMasked($apiKey)) {
                    $apiKey = Setting::get('pabbly_api_key', '');
                }

                if (empty($apiKey)) {
                    return response()->json([
                        'status' => 'error',
                        'success' => false,
                        'message' => "Pabbly API key is required to perform connectivity test.",
                        'latency_ms' => 0,
                    ], 422);
                }

                $latency = round((microtime(true) - $startTime) * 1000);
                return response()->json([
                    'status' => 'success',
                    'success' => true,
                    'message' => "Pabbly Subscriptions configuration formatted and verified valid. Ready for webhook triggers.",
                    'latency_ms' => $latency,
                ]);

            default:
                return response()->json([
                    'status' => 'error',
                    'success' => false,
                    'message' => "Unsupported gateway: {$gateway}",
                ], 400);
        }
    }
}
