<?php

namespace App\Services;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected static function configured(): bool
    {
        $cloud = config('services.cloudinary.cloud_name');
        $key = config('services.cloudinary.api_key');
        $secret = config('services.cloudinary.api_secret');

        return ! empty(trim((string) $cloud)) && ! empty(trim((string) $key)) && ! empty(trim((string) $secret));
    }

    /**
     * Build Cloudinary URL for SDK (cloudinary://api_key:api_secret@cloud_name).
     * Key and secret are URL-encoded in case they contain special characters.
     */
    protected static function cloudinaryUrl(): string
    {
        $cloud = trim((string) config('services.cloudinary.cloud_name'));
        $key = trim((string) config('services.cloudinary.api_key'));
        $secret = trim((string) config('services.cloudinary.api_secret'));

        return 'cloudinary://'.rawurlencode($key).':'.rawurlencode($secret).'@'.$cloud;
    }

    /**
     * Upload an image to Cloudinary and return the secure URL, or null if not configured or upload fails.
     */
    public static function upload(UploadedFile $file, string $folder = 'listings'): ?string
    {
        if (! self::configured()) {
            Log::warning('Cloudinary upload skipped: missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET');

            return null;
        }

        $path = $file->getRealPath();
        if (! $path || ! is_readable($path)) {
            Log::warning('Cloudinary upload failed: file path not readable');

            return null;
        }

        try {
            $config = Configuration::fromCloudinaryUrl(self::cloudinaryUrl());
            $api = new UploadApi($config);
            $result = $api->upload($path, [
                'folder' => $folder,
                'resource_type' => 'image',
            ]);
            $response = $result->getArrayCopy();
            $url = $response['secure_url'] ?? null;

            if (! $url) {
                Log::warning('Cloudinary upload returned no secure_url', ['response' => $response]);
            }

            return $url;
        } catch (\Throwable $e) {
            Log::error('Cloudinary upload failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

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

        try {
            $config = \Cloudinary\Configuration\Configuration::fromCloudinaryUrl(self::cloudinaryUrl());
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
