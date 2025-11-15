// Storage Functions untuk Persistent Data
// Menggunakan window.storage API dari Claude

const StorageManager = {
    // Get data dari storage
    async get(key) {
        try {
            const result = await window.storage.get(key);
            return result ? JSON.parse(result.value) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    // Set data ke storage
    async set(key, value) {
        try {
            await window.storage.set(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    // Delete data dari storage
    async delete(key) {
        try {
            await window.storage.delete(key);
            return true;
        } catch (error) {
            console.error('Storage delete error:', error);
            return false;
        }
    },

    // List semua keys dengan prefix tertentu
    async list(prefix) {
        try {
            const result = await window.storage.list(prefix);
            return result ? result.keys : [];
        } catch (error) {
            console.error('Storage list error:', error);
            return [];
        }
    }
};

// Hash password menggunakan SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Initialize Admin Account (username: admin, password: admin123)
async function initializeAdmin() {
    const adminExists = await StorageManager.get('user:admin:admin');
    
    if (!adminExists) {
        const hashedPassword = await hashPassword('admin123');
        await StorageManager.set('user:admin:admin', {
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString()
        });
        console.log('Admin account created successfully');
    } else {
        console.log('Admin account already exists');
    }
}

// Utility: Generate Session ID
function generateSessionId() {
    return 'SESSION-' + Date.now();
}

// Utility: Format Tanggal Indonesia
function formatTanggal(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Utility: Format Waktu Indonesia
function formatWaktu(date) {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Show Alert/Notification
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.textContent = message;
    
    // Insert at top of body or specific container
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Show Loading Spinner
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingDiv);
}

// Hide Loading Spinner
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Validate Password (min 8 digit angka)
function validatePassword(password) {
    const regex = /^\d{8,}$/;
    if (!regex.test(password)) {
        return {
            valid: false,
            message: 'Password harus minimal 8 digit angka!'
        };
    }
    return { valid: true };
}

// Get Current User dari sessionStorage (untuk navigasi antar halaman)
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Set Current User ke sessionStorage
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear Current User (Logout)
function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Redirect jika belum login
function requireAuth(requiredRole = null) {
    const user = getCurrentUser();
    
    if (!user) {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = '../index.html';
        return false;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        alert('Anda tidak memiliki akses ke halaman ini!');
        window.location.href = '../index.html';
        return false;
    }
    
    return true;
}

console.log('Storage.js loaded successfully');