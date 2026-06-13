document.addEventListener('DOMContentLoaded', () => {
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', (e) => {
            // Animasi riak kecil / klik log
            console.log('Google login button clicked.');
            
            // Simulasikan login dan arahkan ke dashboard
            window.location.href = '/dashboard';
        });
    }
});
