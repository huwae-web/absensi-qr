// GPS & Location Functions

// Get Current GPS Position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser ini'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let errorMessage = 'Tidak dapat mengakses lokasi';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Izin akses lokasi ditolak. Mohon aktifkan GPS dan berikan izin.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Permintaan lokasi timeout. Coba lagi.';
                        break;
                }
                
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Calculate distance between two GPS coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

// Validate if user is within allowed distance (10 meters)
function validateDistance(userLat, userLon, targetLat, targetLon, maxDistance) {
    maxDistance = maxDistance || 10; // Default 10 meters
    
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
    
    return {
        isValid: distance <= maxDistance,
        distance: Math.round(distance),
        maxDistance: maxDistance
    };
}

// Format GPS coordinates for display
function formatGPS(latitude, longitude) {
    return latitude.toFixed(6) + ', ' + longitude.toFixed(6);
}

// Get GPS with loading indicator
async function getGPSWithLoading(loadingMessage) {
    loadingMessage = loadingMessage || 'Mengambil lokasi GPS...';
    
    try {
        showLoading();
        
        // Show custom message
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = '<div class="bg-white rounded-lg p-6 text-center">' +
                '<div class="spinner mx-auto mb-4"></div>' +
                '<p class="text-gray-700 font-medium">' + loadingMessage + '</p>' +
                '<p class="text-sm text-gray-500 mt-2">Pastikan GPS Anda aktif</p>' +
                '</div>';
        }
        
        const position = await getCurrentPosition();
        hideLoading();
        
        return position;
        
    } catch (error) {
        hideLoading();
        throw error;
    }
}

console.log('✅ GPS.js loaded successfully');