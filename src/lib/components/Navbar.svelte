<script>
    import { page } from '$app/stores';
    import { logoutUser } from '$lib/api.js';

    let { user = null, onLogout = () => {} } = $props();

    let isMenuOpen = $state(false);

    async function handleLogout() {
        try {
            await logoutUser();
            onLogout();
        } catch (e) {
            console.error('Logout error:', e);
            onLogout();
        }
    }
</script>

<header class="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <!-- Brand Logo -->
            <a href="/" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-blue-200">
                        <path d="M19.5 22.5a3 3 0 003-3v-8.174l-6.879 4.022 3.485 1.876a.75.75 0 11-.712 1.321l-5.683-3.06a1.5 1.5 0 00-1.422 0l-5.683 3.06a.75.75 0 01-.712-1.32l3.485-1.877L1.5 11.326V19.5a3 3 0 003 3h15z" />
                        <path d="M1.5 9.589v-.745a3 3 0 011.578-2.641l7.5-4.039a3 3 0 012.844 0l7.5 4.039A3 3 0 0122.5 8.844v.745l-8.426 4.926-.652-.35a3 3 0 00-2.844 0l-.652.35L1.5 9.59z" />
                    </svg>
                </div>
                <div>
                    <span class="font-bold text-lg tracking-tight block leading-tight">E-SURAT</span>
                    <span class="text-xs text-blue-200 uppercase tracking-wider block">Desa Mengeruda</span>
                </div>
            </a>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center gap-6">
                <a href="/" class="text-sm font-medium hover:text-blue-200 transition-colors">Beranda</a>
                <a href="/validasi" class="text-sm font-medium hover:text-blue-200 transition-colors">Cek Validasi Surat</a>

                {#if user}
                    {#if user.roles?.includes('admin_surat') || user.roles?.includes('Super Admin') || user.roles?.includes('Admin')}
                        <a href="/admin" class="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-sm font-semibold transition-all shadow-sm">
                            Panel Admin
                        </a>
                    {:else}
                        <a href="/dashboard" class="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-sm font-semibold transition-all shadow-sm">
                            Dasbor Warga
                        </a>
                    {/if}

                    <div class="flex items-center gap-3 pl-4 border-l border-blue-700">
                        <span class="text-sm font-medium text-blue-100">{user.name}</span>
                        <button 
                            onclick={handleLogout}
                            class="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md font-semibold transition-all"
                        >
                            Keluar
                        </button>
                    </div>
                {:else}
                    <div class="flex items-center gap-3">
                        <a href="/login" class="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                            Masuk
                        </a>
                        <a href="/register" class="text-sm font-semibold bg-white text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-blue-50 shadow-md transition-all">
                            Daftar Akun
                        </a>
                    </div>
                {/if}
            </nav>

            <!-- Mobile menu button -->
            <div class="md:hidden">
                <button 
                    onclick={() => isMenuOpen = !isMenuOpen}
                    class="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Nav -->
    {#if isMenuOpen}
        <div class="md:hidden bg-blue-900 border-t border-blue-800 px-4 pt-2 pb-4 space-y-2">
            <a href="/" class="block py-2 text-sm font-medium hover:text-blue-200">Beranda</a>
            <a href="/validasi" class="block py-2 text-sm font-medium hover:text-blue-200">Cek Validasi Surat</a>
            {#if user}
                {#if user.roles?.includes('admin_surat') || user.roles?.includes('Super Admin') || user.roles?.includes('Admin')}
                    <a href="/admin" class="block py-2 text-sm font-semibold text-blue-200">Panel Admin</a>
                {:else}
                    <a href="/dashboard" class="block py-2 text-sm font-semibold text-blue-200">Dasbor Warga</a>
                {/if}
                <button onclick={handleLogout} class="w-full text-left py-2 text-sm text-red-300 font-semibold">Keluar</button>
            {:else}
                <div class="pt-2 flex gap-2">
                    <a href="/login" class="flex-1 text-center py-2 rounded-lg bg-white/10 font-semibold text-sm">Masuk</a>
                    <a href="/register" class="flex-1 text-center py-2 rounded-lg bg-white text-[#1e3a8a] font-semibold text-sm">Daftar Akun</a>
                </div>
            {/if}
        </div>
    {/if}
</header>
