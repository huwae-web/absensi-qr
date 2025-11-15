// QR Code Functions
// Requires: qrcode.min.js from CDN

// Generate QR Code
function generateQRCode(containerId, data, size) {
    size = size || 300;
    
    // Clear container first
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('QR Container not found:', containerId);
        return false;
    }
    
    container.innerHTML = '';
    
    try {
        // Generate QR Code using QRCode.js library
        new QRCode(container, {
            text: data,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        console.log('✅ QR Code generated successfully');
        return true;
        
    } catch (error) {
        console.error('❌ QR Code generation error:', error);
        container.innerHTML = '<p class="text-red-600">Error generating QR Code</p>';
        return false;
    }
}

// Create Session Data for QR Code
function createSessionQRData(sessionData) {
    // Session data yang akan di-encode ke QR
    const qrData = {
        sessionId: sessionData.sessionId,
        mataKuliah: sessionData.mataKuliah,
        kelas: sessionData.kelas,
        gpsLat: sessionData.gpsLat,
        gpsLong: sessionData.gpsLong,
        timestamp: sessionData.timestampMulai
    };
    
    return JSON.stringify(qrData);
}

// Parse QR Code Data
function parseQRData(qrString) {
    try {
        const data = JSON.parse(qrString);
        
        // Validate required fields
        if (!data.sessionId || !data.gpsLat || !data.gpsLong || !data.timestamp) {
            throw new Error('Invalid QR Code format');
        }
        
        return {
            success: true,
            data: data
        };
        
    } catch (error) {
        console.error('QR Parse error:', error);
        return {
            success: false,
            message: 'QR Code tidak valid atau rusak'
        };
    }
}

// Check if QR Code is still valid (15 minutes limit)
function isQRCodeValid(timestamp) {
    const now = Date.now();
    const elapsed = (now - timestamp) / 1000 / 60; // minutes
    
    return {
        isValid: elapsed <= 15,
        elapsedMinutes: Math.round(elapsed),
        remainingMinutes: Math.max(0, Math.round(15 - elapsed))
    };
}

// Download QR Code as Image
function downloadQRCode(containerId, filename) {
    filename = filename || 'qrcode.png';
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('QR Container not found');
        return false;
    }
    
    // Get the canvas or image element
    const canvas = container.querySelector('canvas');
    const img = container.querySelector('img');
    
    if (canvas) {
        // Convert canvas to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
        return true;
    } else if (img) {
        // Download image directly
        const a = document.createElement('a');
        a.href = img.src;
        a.download = filename;
        a.click();
        return true;
    } else {
        console.error('No QR Code image found');
        return false;
    }
}

console.log('✅ QR.js loaded successfully');