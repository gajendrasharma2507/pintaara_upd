<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SequelLogisticsService
{
    protected string $env;
    protected string $clientCode;
    protected string $storeCode;
    protected string $originPincode;
    protected string $token;
    protected string $endpoint;

    public function __construct()
    {
        $this->env = Setting::get('sequel_env', config('services.sequel247.env', 'test'));
        $this->clientCode = (string) Setting::get('sequel_client_code', config('services.sequel247.client_code', '31492'));
        $this->storeCode = Setting::get('sequel_store_code', config('services.sequel247.store_code', 'PINTARA'));
        $this->originPincode = (string) Setting::get('sequel_origin_pincode', config('services.sequel247.origin_pincode', '400001'));

        if ($this->env === 'production' || $this->env === 'prod') {
            $this->token = Setting::get('sequel_prod_token', config('services.sequel247.prod_token', ''));
            $this->endpoint = rtrim(Setting::get('sequel_prod_endpoint', config('services.sequel247.prod_endpoint', 'https://sequel247.com/')), '/') . '/';
        } else {
            $this->token = Setting::get('sequel_test_token', config('services.sequel247.test_token', ''));
            $this->endpoint = rtrim(Setting::get('sequel_test_endpoint', config('services.sequel247.test_endpoint', 'https://test.sequel247.com/')), '/') . '/';
        }
    }

    /**
     * Get active connection details (safe for admin inspection).
     */
    public function getEnvironmentInfo(): array
    {
        return [
            'env' => $this->env,
            'client_code' => $this->clientCode,
            'store_code' => $this->storeCode,
            'origin_pincode' => $this->originPincode,
            'endpoint' => $this->endpoint,
            'is_production' => $this->env === 'production',
        ];
    }

    /**
     * Verify pin code serviceability for delivery & pickup.
     */
    public function checkServiceability(string $pinCode): array
    {
        $url = $this->endpoint . 'api/checkServiceability';
        $payload = [
            'token' => $this->token,
            'pin_code' => trim($pinCode),
        ];

        try {
            $response = Http::timeout(15)->post($url, $payload);
            $json = $response->json();

            return [
                'success' => $response->successful() && !empty($json['status']),
                'data' => $json,
                'status_code' => $response->status(),
            ];
        } catch (Exception $e) {
            Log::error('Sequel247 checkServiceability error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate Estimated Delivery Date (EDD).
     */
    public function calculateEDD(?string $origin = null, ?string $destination = null, ?string $pickupDate = null): array
    {
        $url = $this->endpoint . 'api/shipment/calculateEDD';
        $origin = $origin ?: $this->originPincode;
        $pickupDate = $pickupDate ?: date('Y-m-d');

        $payload = [
            'token' => $this->token,
            'origin_pincode' => trim($origin),
            'destination_pincode' => trim($destination ?: ''),
            'pickup_date' => $pickupDate,
        ];

        try {
            $response = Http::timeout(15)->post($url, $payload);
            $json = $response->json();

            return [
                'success' => $response->successful() && !empty($json['status']),
                'data' => $json,
                'status_code' => $response->status(),
            ];
        } catch (Exception $e) {
            Log::error('Sequel247 calculateEDD error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create Sequel Armored Shipment Docket (AWB) for high-value diamond & jewelry order.
     */
    public function createShipment(Order $order, array $options = []): array
    {
        $url = $this->endpoint . 'api/shipment/create';

        // Parse address
        $rawAddr = $order->shipping_address;
        $address = [];
        if (is_array($rawAddr)) {
            $address = $rawAddr;
        } elseif (is_string($rawAddr) && str_starts_with(trim($rawAddr), '{')) {
            $address = json_decode($rawAddr, true) ?: [];
        } elseif (is_string($rawAddr) && !empty($rawAddr)) {
            $address = ['address' => $rawAddr];
            if (preg_match('/\b[1-9][0-9]{5}\b/', $rawAddr, $m)) {
                $address['pincode'] = $m[0];
            }
        }

        $consigneeName = $options['consignee_name'] ?? $address['name'] ?? $order->customer_name ?? 'Valued Patron';
        $contactPhone = $options['contact_number'] ?? $address['phone'] ?? $order->customer_phone ?? '9876543210';
        $pinCode = $options['pin_code'] ?? $address['pincode'] ?? $address['postal_code'] ?? $address['zip'] ?? '560001';
        $city = $options['city'] ?? $address['city'] ?? 'Bangalore';
        $state = $options['state'] ?? $address['state'] ?? 'Karnataka';
        $addressLine1 = $options['address_line1'] ?? $address['address'] ?? $address['line1'] ?? 'Flat 101, Jewel Heights';
        $addressLine2 = $options['address_line2'] ?? $address['line2'] ?? '';

        $totalVal = round($options['net_value'] ?? ($order->total_amount ?: 50000), 2);
        $netWeight = $options['net_weight'] ?? 0.050; // kg
        $grossWeight = $options['gross_weight'] ?? 0.250; // kg
        $boxesCount = $options['boxes'] ?? 1;

        $payload = [
            'token' => $this->token,
            'location' => 'domestic',
            'shipmentType' => $options['shipmentType'] ?? 'D&J', // Diamonds & Jewellery
            'serviceType' => $options['serviceType'] ?? 'valuable', // High value armored
            'fromStoreCode' => $this->storeCode,
            'toAddress' => [
                'consignee_name' => $consigneeName,
                'address_line1' => $addressLine1,
                'address_line2' => $addressLine2,
                'pin_code' => (string) $pinCode,
                'city' => $city,
                'state' => $state,
                'country' => 'India',
                'contact_number' => $contactPhone,
            ],
            'net_weight' => $netWeight,
            'gross_weight' => $grossWeight,
            'weight_unit' => 'kg',
            'net_value' => $totalVal,
            'currency' => 'INR',
            'insurance' => 'sequel',
            'boxes' => $boxesCount,
            'packages' => [
                [
                    'box_no' => 1,
                    'weight' => $grossWeight,
                    'length' => 12,
                    'width' => 10,
                    'height' => 8,
                ]
            ],
            'invoice' => [
                'invoice_no' => 'INV-' . ($order->order_number ?: $order->id),
                'invoice_date' => date('Y-m-d'),
                'invoice_value' => $totalVal,
            ]
        ];

        try {
            $response = Http::timeout(20)->post($url, $payload);
            $json = $response->json();

            if ($response->successful() && !empty($json['status'])) {
                $docketNumber = $json['docketNumber'] ?? $json['docket_number'] ?? ($json['data']['docket'] ?? null);
                $pickupToken = $json['token'] ?? $json['brn'] ?? null;

                // Update order model
                $order->update([
                    'docket_number' => $docketNumber,
                    'courier_partner' => 'Sequel 247 Logistics',
                    'pickup_token' => $pickupToken,
                    'logistics_status' => 'DOCKET_CREATED',
                    'status' => 'shipped',
                    'fulfillment_status' => 'Armored In-Transit',
                    'tracking_data' => $json,
                ]);

                return [
                    'success' => true,
                    'docket_number' => $docketNumber,
                    'pickup_token' => $pickupToken,
                    'data' => $json,
                ];
            }

            return [
                'success' => false,
                'message' => $json['message'] ?? 'Failed to create Sequel shipment docket',
                'response' => $json,
            ];
        } catch (Exception $e) {
            Log::error('Sequel247 createShipment error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Track a shipment docket live.
     */
    public function trackShipment(string $docketNumber): array
    {
        $url = $this->endpoint . 'api/track';
        $payload = [
            'token' => $this->token,
            'docket' => trim($docketNumber),
        ];

        try {
            $response = Http::timeout(15)->post($url, $payload);
            $json = $response->json();

            return [
                'success' => $response->successful() && !empty($json['status']),
                'data' => $json,
                'status_code' => $response->status(),
            ];
        } catch (Exception $e) {
            Log::error('Sequel247 trackShipment error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel shipment docket.
     */
    public function cancelShipment(string $docketNumber, string $reason = 'Customer requested cancellation'): array
    {
        $url = $this->endpoint . 'api/cancel';
        $payload = [
            'token' => $this->token,
            'docket' => trim($docketNumber),
            'cancelReason' => $reason,
        ];

        try {
            $response = Http::timeout(15)->post($url, $payload);
            $json = $response->json();

            return [
                'success' => $response->successful() && !empty($json['status']),
                'data' => $json,
                'status_code' => $response->status(),
            ];
        } catch (Exception $e) {
            Log::error('Sequel247 cancelShipment error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
