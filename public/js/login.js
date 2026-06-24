document.addEventListener('DOMContentLoaded', () => {
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', (e) => {
            // Animasi riak kecil / klik log
            console.log('Google login button clicked.');
            
            // Arahkan ke rute backend autentikasi Google
            window.location.href = '/auth/google';
        });
    }
});
