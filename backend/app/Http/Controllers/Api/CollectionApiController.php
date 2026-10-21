<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use Illuminate\Http\JsonResponse;

class CollectionApiController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = CollectionMaster::where('status', 'active')
            ->withCount(['products' => function($q) {
                $q->where('status', 'active');
            }])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $collections,
        ]);
    }
}
