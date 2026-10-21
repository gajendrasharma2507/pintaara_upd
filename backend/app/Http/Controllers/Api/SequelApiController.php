<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\SequelLogisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SequelApiController extends Controller
{
    protected SequelLogisticsService $sequelService;

    public function __construct(SequelLogisticsService $sequelService)
    {
        $this->sequelService = $sequelService;
    }

    /**
     * Get logistics connection status / environment configuration
     */
    public function configInfo(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->sequelService->getEnvironmentInfo(),
        ]);
    }

    /**
     * Check if a destination pincode is serviceable by Sequel 247
     */
    public function checkServiceability(Request $request): JsonResponse
    {
        $request->validate([
            'pincode' => 'required|string|min:6|max:6',
        ]);

        $res = $this->sequelService->checkServiceability($request->pincode);

        if (!empty($res['success'])) {
            return response()->json([
                'status' => 'success',
                'serviceable' => true,
                'data' => $res['data'],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'serviceable' => false,
            'message' => $res['data']['message'] ?? $res['error'] ?? 'Pincode is not currently serviceable by Sequel 247',
            'data' => $res['data'] ?? null,
        ], 400);
    }

    /**
     * Calculate Estimated Delivery Date (EDD)
     */
    public function calculateEDD(Request $request): JsonResponse
    {
        $request->validate([
            'destination_pincode' => 'required|string|min:6|max:6',
            'origin_pincode' => 'nullable|string|min:6|max:6',
            'pickup_date' => 'nullable|date_format:Y-m-d',
        ]);

        $res = $this->sequelService->calculateEDD(
            $request->origin_pincode,
            $request->destination_pincode,
            $request->pickup_date
        );

        if (!empty($res['success'])) {
            return response()->json([
                'status' => 'success',
                'data' => $res['data'],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $res['data']['message'] ?? $res['error'] ?? 'Unable to calculate estimated delivery date',
        ], 400);
    }

    /**
     * Generate Sequel Armored Transit Docket (AWB) for an Order
     */
    public function createDocket(Request $request, int|string $orderId): JsonResponse
    {
        $order = Order::where('id', $orderId)->orWhere('order_number', $orderId)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        $options = array_merge([
            'net_weight' => 0.050,
            'gross_weight' => 0.250,
            'boxes' => 1,
            'shipmentType' => 'D&J',
            'serviceType' => 'valuable',
        ], $request->all());

        $res = $this->sequelService->createShipment($order, $options);

        if (!empty($res['success'])) {
            return response()->json([
                'status' => 'success',
                'message' => 'Sequel 247 Armored Docket created successfully',
                'docket_number' => $res['docket_number'],
                'pickup_token' => $res['pickup_token'],
                'data' => $res['data'],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $res['message'] ?? $res['error'] ?? 'Failed to generate Sequel docket',
            'details' => $res['response'] ?? null,
        ], 400);
    }

    /**
     * Live Tracking for an Order's Docket
     */
    public function trackDocket(int|string $orderId): JsonResponse
    {
        $order = Order::where('id', $orderId)->orWhere('order_number', $orderId)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        if (empty($order->docket_number)) {
            return response()->json([
                'status' => 'error',
                'message' => 'No Sequel docket has been generated for this order yet',
            ], 400);
        }

        $res = $this->sequelService->trackShipment($order->docket_number);

        if (!empty($res['success'])) {
            // Update latest tracking snapshot on order
            $order->update([
                'tracking_data' => $res['data'],
            ]);

            return response()->json([
                'status' => 'success',
                'docket_number' => $order->docket_number,
                'data' => $res['data'],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $res['data']['message'] ?? $res['error'] ?? 'Failed to fetch live tracking details',
        ], 400);
    }

    /**
     * Cancel an active Sequel docket
     */
    public function cancelDocket(Request $request, int|string $orderId): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $order = Order::where('id', $orderId)->orWhere('order_number', $orderId)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        if (empty($order->docket_number)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order does not have an active docket',
            ], 400);
        }

        $res = $this->sequelService->cancelShipment($order->docket_number, $request->reason ?? 'Cancelled by administrator');

        if (!empty($res['success'])) {
            $order->update([
                'logistics_status' => 'DOCKET_CANCELLED',
                'fulfillment_status' => 'Cancelled',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Sequel docket cancelled successfully',
                'data' => $res['data'],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $res['data']['message'] ?? $res['error'] ?? 'Failed to cancel docket',
        ], 400);
    }
}
