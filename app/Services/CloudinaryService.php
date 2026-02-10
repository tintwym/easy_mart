<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected static function configured(): bool
    {
        $cloud = config('services.cloudinary.cloud_name');
        $key = config('services.cloudinary.api_key');
        $secret = config('services.cloudinary.api_secret');

        return $cloud && $key && $secret;
    }

    /**
     * Upload an image to Cloudinary and return the secure URL, or null if not configured or upload fails.
     */
    public static function upload(UploadedFile $file, string $folder = 'listings'): ?string
    {
        if (! self::configured()) {
            return null;
        }

        $config = [
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ];

        try {
            $api = new UploadApi($config);
            $result = $api->upload($file->getRealPath(), [
                'folder' => $folder,
            ]);
            $response = $result->getArrayCopy();

            return $response['secure_url'] ?? null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Delete an asset by URL (extracts public_id from Cloudinary URL). No-op if not a Cloudinary URL.
     */
    public static function deleteByUrl(string $url): bool
    {
        if (! self::configured() || ! str_contains($url, 'res.cloudinary.com')) {
            return false;
        }

        $publicId = self::publicIdFromUrl($url);
        if (! $publicId) {
            return false;
        }

        $config = [
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ];

        try {
            $api = new \Cloudinary\Api\Admin\AdminApi($config);
            $api->deleteAssets($publicId);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    protected static function publicIdFromUrl(string $url): ?string
    {
        if (! preg_match('#/v\d+/(.+?)\.(?:jpg|jpeg|png|gif|webp)(?:\?|$)#', $url, $m)) {
            return null;
        }

        return $m[1];
    }
}
