// Authentication Functions

// Login Admin
async function loginAdmin(username, password) {
    try {
        showLoading();
        
        // Get admin data
        const admin = await StorageManager.get('user:admin:admin');
        
        if (!admin) {
            hideLoading();
            return { success: false, message: 'Admin tidak ditemukan!' };
        }
        
        // Hash password input
        const hashedPassword = await hashPassword(password);
        
        // Verify password
        if (admin.username !== username || admin.password !== hashedPassword) {
            hideLoading();
            return { success: false, message: 'Username atau password salah!' };
        }
        
        // Set current user
        setCurrentUser(admin);
        
        hideLoading();
        return { success: true, user: admin };
        
    } catch (error) {
        hideLoading();
        console.error('Login admin error:', error);
        return { success: false, message: 'Terjadi kesalahan saat login!' };
    }
}

// Login Dosen
async function loginDosen(nidn, password) {
    try {
        showLoading();
        
        // Get dosen data
        const dosen = await StorageManager.get('user:dosen:' + nidn);
        
        if (!dosen) {
            hideLoading();
            return { success: false, message: 'NIDN tidak terdaftar!' };
        }
        
        // Check if approved
        if (!dosen.approved) {
            hideLoading();
            return { success: false, message: 'Akun Anda belum disetujui admin!' };
        }
        
        // Hash password input
        const hashedPassword = await hashPassword(password);
        
        // Verify password
        if (dosen.password !== hashedPassword) {
            hideLoading();
            return { success: false, message: 'Password salah!' };
        }
        
        // Set current user
        setCurrentUser(dosen);
        
        hideLoading();
        return { success: true, user: dosen };
        
    } catch (error) {
        hideLoading();
        console.error('Login dosen error:', error);
        return { success: false, message: 'Terjadi kesalahan saat login!' };
    }
}

// Login Mahasiswa
async function loginMahasiswa(npm, password) {
    try {
        showLoading();
        
        // Get mahasiswa data
        const mahasiswa = await StorageManager.get('user:mahasiswa:' + npm);
        
        if (!mahasiswa) {
            hideLoading();
            return { success: false, message: 'NPM tidak terdaftar!' };
        }
        
        // Hash password input
        const hashedPassword = await hashPassword(password);
        
        // Verify password
        if (mahasiswa.password !== hashedPassword) {
            hideLoading();
            return { success: false, message: 'Password salah!' };
        }
        
        // Set current user
        setCurrentUser(mahasiswa);
        
        hideLoading();
        return { success: true, user: mahasiswa };
        
    } catch (error) {
        hideLoading();
        console.error('Login mahasiswa error:', error);
        return { success: false, message: 'Terjadi kesalahan saat login!' };
    }
}

// Register Dosen
async function registerDosen(nidn, nama, password) {
    try {
        showLoading();
        
        // Validate password
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            hideLoading();
            return { success: false, message: passwordCheck.message };
        }
        
        // Check if NIDN already exists
        const existing = await StorageManager.get('user:dosen:' + nidn);
        if (existing) {
            hideLoading();
            return { success: false, message: 'NIDN sudah terdaftar!' };
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create dosen account
        const dosenData = {
            nidn: nidn,
            nama: nama,
            password: hashedPassword,
            role: 'dosen',
            approved: false, // Menunggu persetujuan admin
            createdAt: new Date().toISOString()
        };
        
        await StorageManager.set('user:dosen:' + nidn, dosenData);
        
        hideLoading();
        return { 
            success: true, 
            message: 'Registrasi berhasil! Menunggu persetujuan admin.' 
        };
        
    } catch (error) {
        hideLoading();
        console.error('Register dosen error:', error);
        return { success: false, message: 'Terjadi kesalahan saat registrasi!' };
    }
}

// Register Mahasiswa
async function registerMahasiswa(npm, nama, kelas, password) {
    try {
        showLoading();
        
        // Validate password
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            hideLoading();
            return { success: false, message: passwordCheck.message };
        }
        
        // Check if NPM already exists
        const existing = await StorageManager.get('user:mahasiswa:' + npm);
        if (existing) {
            hideLoading();
            return { success: false, message: 'NPM sudah terdaftar!' };
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create mahasiswa account
        const mahasiswaData = {
            npm: npm,
            nama: nama,
            kelas: kelas,
            password: hashedPassword,
            role: 'mahasiswa',
            createdAt: new Date().toISOString()
        };
        
        await StorageManager.set('user:mahasiswa:' + npm, mahasiswaData);
        
        hideLoading();
        return { 
            success: true, 
            message: 'Registrasi berhasil! Silakan login.' 
        };
        
    } catch (error) {
        hideLoading();
        console.error('Register mahasiswa error:', error);
        return { success: false, message: 'Terjadi kesalahan saat registrasi!' };
    }
}

// Logout
function logout() {
    clearCurrentUser();
    window.location.href = '../index.html';
}

console.log('Auth.js loaded successfully');