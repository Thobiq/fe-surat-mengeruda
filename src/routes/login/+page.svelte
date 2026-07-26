<script>
    import { loginUser } from '$lib/api.js';
    import { userStore, fetchAuthUser } from '$lib/stores/auth.js';

    let email = $state('');
    let password = $state('');
    let remember = $state(false);
    let loading = $state(false);
    let errorMsg = $state(null);

    async function handleLogin(e) {
        e.preventDefault();
        loading = true;
        errorMsg = null;

        try {
            const res = await loginUser(email, password, remember);
            if (res.status === 'success') {
                const user = await fetchAuthUser();
                if (user?.roles?.includes('admin_surat') || user?.roles?.includes('Super Admin') || user?.roles?.includes('Admin')) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (e) {
            errorMsg = e.response?.data?.message || 'Gagal masuk. Periksa kembali email dan password Anda.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="py-12 bg-slate-100 flex-1 flex flex-col justify-center">
    <div class="max-w-md mx-auto px-4 w-full">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div class="bg-[#1e3a8a] px-8 py-6 text-white text-center">
                <h1 class="text-2xl font-extrabold tracking-tight">Masuk E-Surat</h1>
                <p class="text-xs text-blue-200 mt-1">Layanan Surat Digital Warga Desa Mengeruda</p>
            </div>

            <div class="p-8">
                {#if errorMsg}
                    <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                        {errorMsg}
                    </div>
                {/if}

                <form onsubmit={handleLogin} class="space-y-4">
                    <div>
                        <label for="email" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Alamat Email
                        </label>
                        <input 
                            id="email"
                            type="email" 
                            bind:value={email}
                            placeholder="email@contoh.com"
                            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                            required 
                        />
                    </div>

                    <div>
                        <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Password
                        </label>
                        <input 
                            id="password"
                            type="password" 
                            bind:value={password}
                            placeholder="••••••••"
                            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                            required 
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" bind:checked={remember} class="rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]" />
                            <span>Ingat saya</span>
                        </label>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        class="w-full py-3 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                    </button>
                </form>

                <div class="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
                    Belum punya akun warga? 
                    <a href="/register" class="font-bold text-[#1e3a8a] hover:underline">Daftar Akun Baru</a>
                </div>
            </div>
        </div>
    </div>
</div>
