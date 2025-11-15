// Storage Functions - Support localStorage sebagai fallback
// Jika window.storage tidak tersedia, gunakan localStorage

const StorageManager = {
    // Detect storage type
    useLocalStorage: !window.storage,
    
    // Get data dari storage
    async get(key) {
        try {
            if (this.useLocalStorage) {
                // Use localStorage
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } else {
                // Use window.storage
                const result = await window.storage.get(key);
                return result ? JSON.parse(result.value) : null;
            }
        } catch (error) {
            console.error('Storage get error for key:', key, error);
            return null;
        }
    },

    // Set data ke storage
    async set(key, value) {
        try {
            if (this.useLocalStorage) {
                // Use localStorage
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } else {
                // Use window.storage
                await window.storage.set(key, JSON.stringify(value));
                return true;
            }
        } catch (error) {
            console.error('Storage set error for key:', key, error);
            return false;
        }
    },

    // Delete data dari storage
    async delete(key) {
        try {
            if (this.useLocalStorage) {
                // Use localStorage
                localStorage.removeItem(key);
                return true;
            } else {
                // Use window.storage
                await window.storage.delete(key);
                return true;
            }
        } catch (error) {
            console.error('Storage delete error for key:', key, error);
            return false;
        }
    },

    // List semua keys dengan prefix tertentu
    async list(prefix) {
        try {
            if (this.useLocalStorage) {
                // Use localStorage - filter by prefix
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(prefix)) {
                        keys.push(key);
                    }
                }
                return keys;
            } else {
                // Use window.storage
                const result = await window.storage.list(prefix);
                return result ? result.keys : [];
            }
        } catch (error) {
            console.error('Storage list error for prefix:', prefix, error);
            return [];
        }
    }
};

// Hash password menggunakan SHA-256
async function hashPassword(password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error('Hash password error:', error);
        return null;
    }
}

// Initialize Admin Account (username: admin, password: admin123)
async function initializeAdmin() {
    try {
        console.log('🔧 Initializing admin account...');
        console.log('📦 Storage type:', StorageManager.useLocalStorage ? 'localStorage' : 'window.storage');
        
        // Try to get existing admin
        const adminExists = await StorageManager.get('user:admin:admin');
        
        if (!adminExists) {
            console.log('👤 Admin not found, creating new admin account...');
            const hashedPassword = await hashPassword('admin123');
            
            if (!hashedPassword) {
                console.error('❌ Failed to hash password!');
                return false;
            }
            
            const adminData = {
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            
            const success = await StorageManager.set('user:admin:admin', adminData);
            
            if (success) {
                console.log('✅ Admin account created successfully!');
                console.log('   Username: admin');
                console.log('   Password: admin123');
                return true;
            } else {
                console.error('❌ Failed to create admin account!');
                return false;
            }
        } else {
            console.log('✅ Admin account already exists');
            return true;
        }
    } catch (error) {
        console.error('❌ Initialize admin error:', error);
        return false;
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
    alertDiv.className = 'alert alert-' + type + ' fade-in';
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(function() {
        alertDiv.style.opacity = '0';
        setTimeout(function() { alertDiv.remove(); }, 300);
    }, 5000);
}

// Show Loading Spinner
function showLoading() {
    hideLoading();
    
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

// Get Current User dari sessionStorage
function getCurrentUser() {
    try {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

// Set Current User ke sessionStorage
function setCurrentUser(user) {
    try {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        console.log('✅ Current user set:', user.username || user.nama);
    } catch (error) {
        console.error('Set current user error:', error);
    }
}

// Clear Current User (Logout)
function clearCurrentUser() {
    try {
        sessionStorage.removeItem('currentUser');
        console.log('✅ Current user cleared');
    } catch (error) {
        console.error('Clear current user error:', error);
    }
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Redirect jika belum login
function requireAuth(requiredRole) {
    requiredRole = requiredRole || null;
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

console.log('✅ Storage.js loaded successfully');
console.log('📦 Using:', StorageManager.useLocalStorage ? 'localStorage' : 'window.storage API');