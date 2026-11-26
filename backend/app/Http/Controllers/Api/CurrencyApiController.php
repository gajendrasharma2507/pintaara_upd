<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyExchangeService;
use Illuminate\Http\JsonResponse;

class CurrencyApiController extends Controller
{
    public function rates(CurrencyExchangeService $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $service->getEnabledRatesPayload(),
        ]);
    }
}
