/**
 * Geolocation Service
 * Detects user location and converts to address
 */

export interface GeolocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  address?: {
    country: string;
    countryCode: string;
    state: string;
    city: string;
    postalCode: string;
    formattedAddress: string;
  };
  error?: string;
}

export interface GeolocationPermission {
  state: 'granted' | 'denied' | 'prompt';
}

/**
 * Check if geolocation is supported in the browser
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Check geolocation permission status
 */
export async function checkGeolocationPermission(): Promise<GeolocationPermission> {
  if (typeof window === 'undefined' || !navigator.permissions) {
    return { state: 'prompt' };
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return { state: result.state as GeolocationPermission['state'] };
  } catch {
    return { state: 'prompt' };
  }
}

/**
 * Get current position using browser Geolocation API
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Informasi lokasi tidak tersedia.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Waktu permintaan lokasi habis. Silakan coba lagi.'));
            break;
          default:
            reject(new Error('Gagal mendapatkan lokasi.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Reverse geocode coordinates to address using free OpenStreetMap Nominatim API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeolocationResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'TenunanSongket/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    const address = data.address || {};

    // Map country to our supported regions
    const countryCode = (address.country_code || '').toUpperCase();
    let mappedCountryCode = countryCode;
    
    // Map common variations
    if (countryCode === 'MY') mappedCountryCode = 'MY';
    else if (countryCode === 'SG') mappedCountryCode = 'SG';
    else if (countryCode === 'BN') mappedCountryCode = 'BN';

    return {
      success: true,
      latitude,
      longitude,
      address: {
        country: address.country || '',
        countryCode: mappedCountryCode,
        state: address.state || address.region || address.county || '',
        city: address.city || address.town || address.village || address.municipality || '',
        postalCode: address.postcode || '',
        formattedAddress: data.display_name || '',
      },
    };
  } catch (error) {
    return {
      success: false,
      latitude,
      longitude,
      error: error instanceof Error ? error.message : 'Failed to get address',
    };
  }
}

/**
 * Detect user location and get address
 * Main function to call for location detection
 */
export async function detectUserLocation(): Promise<GeolocationResult> {
  try {
    // Check permission first
    const permission = await checkGeolocationPermission();
    if (permission.state === 'denied') {
      return {
        success: false,
        error: 'Akses lokasi telah ditolak. Silakan aktifkan di pengaturan browser.',
      };
    }

    // Get current position
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    // Reverse geocode to address
    const result = await reverseGeocode(latitude, longitude);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mendeteksi lokasi',
    };
  }
}

/**
 * Map detected country to supported shipping regions
 */
export function mapToSupportedCountry(countryCode: string): {
  isSupported: boolean;
  country: string;
  countryCode: string;
  defaultCurrency: string;
} {
  const supportedCountries: Record<string, { name: string; currency: string }> = {
    'MY': { name: 'Malaysia', currency: 'MYR' },
    'SG': { name: 'Singapore', currency: 'SGD' },
    'BN': { name: 'Brunei Darussalam', currency: 'BND' },
  };

  const normalizedCode = countryCode.toUpperCase();
  const country = supportedCountries[normalizedCode];

  if (country) {
    return {
      isSupported: true,
      country: country.name,
      countryCode: normalizedCode,
      defaultCurrency: country.currency,
    };
  }

  return {
    isSupported: false,
    country: 'Unknown',
    countryCode: normalizedCode,
    defaultCurrency: 'BND', // Default to Brunei store currency
  };
}
