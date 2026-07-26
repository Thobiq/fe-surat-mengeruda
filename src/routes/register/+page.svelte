<script>
    import { registerUser } from '$lib/api.js';

    let nik = $state('');
    let name = $state('');
    let phone = $state('');
    let email = $state('');
    let password = $state('');
    let password_confirmation = $state('');
    let ktpFile = $state(null);
    let ktpPreview = $state(null);
    
    let loading = $state(false);
    let errorMsg = $state(null);
    let isSuccess = $state(false);

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            ktpFile = file;
            if (file.type.startsWith('image/')) {
                ktpPreview = URL.createObjectURL(file);
            } else {
                ktpPreview = 'PDF_FILE';
            }
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        if (password !== password_confirmation) {
            errorMsg = 'Konfirmasi password tidak sesuai.';
            return;
        }
        if (!ktpFile) {
            errorMsg = 'Harap melampirkan berkas KTP Anda (gambar atau PDF).';
            return;
        }
        if (nik.length !== 16) {
            errorMsg = 'NIK harus tepat 16 angka sesuai KTP.';
            return;
        }

        loading = true;
        errorMsg = null;

        const fd = new FormData();
        fd.append('nik', nik);
        fd.append('name', name);
        fd.append('phone', phone);
        fd.append('email', email);
        fd.append('password', password);
        fd.append('password_confirmation', password_confirmation);
        fd.append('ktp', ktpFile);

        try {
            const res = await registerUser(fd);
            if (res.status === 'success') {
                isSuccess = true;
            }
        } catch (e) {
            errorMsg = e.response?.data?.message || 'Gagal mendaftar. Pastikan NIK atau Email belum pernah didaftarkan.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="py-12 bg-slate-100 flex-1 flex flex-col justify-center">
    <div class="max-w-xl mx-auto px-4 w-full">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div class="bg-[#1e3a8a] px-8 py-6 text-white text-center">
                <h1 class="text-2xl font-extrabold tracking-tight">Pendaftaran Akun Warga</h1>
                <p class="text-xs text-blue-200 mt-1">Layanan E-Surat Resmi Desa Mengeruda</p>
            </div>

            <div class="p-8">
                {#if isSuccess}
                    <div class="text-center py-6 animate-fadeIn">
                        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Berhasil!</h3>
                        <p class="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                            Akun Anda telah disimpan dalam sistem. Saat ini akun Anda sedang menunggu <strong>verifikasi dokumen KTP oleh Admin Desa</strong> sebelum dapat digunakan untuk mengajukan surat online.
                        </p>
                        <a 
                            href="/login" 
                            class="inline-block px-8 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm shadow-md hover:bg-blue-800 transition-all"
                        >
                            Menuju Halaman Login
                        </a>
                    </div>
                {:else}
                    {#if errorMsg}
                        <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                            {errorMsg}
                        </div>
                    {/if}

                    <form onsubmit={handleRegister} class="space-y-4">
                        <div>
                            <label for="nik" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Nomor Induk Kependudukan (NIK - 16 Angka)
                            </label>
                            <input 
                                id="nik"
                                type="text"
                                bind:value={nik}
                                maxlength="16"
                                placeholder="3512345678901234"
                                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm font-mono"
                                required 
                            />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Lengkap (Sesuai KTP)
                                </label>
                                <input 
                                    id="name"
                                    type="text" 
                                    bind:value={name}
                                    placeholder="Nama Lengkap"
                                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                                    required 
                                />
                            </div>

                            <div>
                                <label for="phone" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    No. HP / WhatsApp
                                </label>
                                <input 
                                    id="phone"
                                    type="text" 
                                    bind:value={phone}
                                    placeholder="081234567890"
                                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                                    required 
                                />
                            </div>
                        </div>

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

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Password
                                </label>
                                <input 
                                    id="password"
                                    type="password" 
                                    bind:value={password}
                                    placeholder="Min. 8 karakter"
                                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                                    required 
                                />
                            </div>

                            <div>
                                <label for="password_confirmation" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Ulangi Password
                                </label>
                                <input 
                                    id="password_confirmation"
                                    type="password" 
                                    bind:value={password_confirmation}
                                    placeholder="Konfirmasi password"
                                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                                    required 
                                />
                            </div>
                        </div>

                        <!-- Upload KTP -->
                        <div class="pt-2">
                            <label for="ktp" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Unggah Dokumen KTP (Foto / PDF - Maks. 4MB)
                            </label>
                            <input 
                                id="ktp"
                                type="file" 
                                accept="image/jpeg,image/png,image/jpg,.pdf"
                                onchange={handleFileChange}
                                class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#1e3a8a] hover:file:bg-blue-100"
                                required
                            />

                            {#if ktpPreview}
                                <div class="mt-3 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                                    {#if ktpPreview === 'PDF_FILE'}
                                        <div class="w-12 h-12 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                            PDF
                                        </div>
                                        <div>
                                            <span class="text-sm font-semibold text-slate-800 block">{ktpFile?.name}</span>
                                            <span class="text-xs text-slate-500">Berkas PDF KTP terlampir</span>
                                        </div>
                                    {:else}
                                        <img src={ktpPreview} alt="Preview KTP" class="h-16 w-24 object-cover rounded border border-slate-300" />
                                        <div>
                                            <span class="text-sm font-semibold text-slate-800 block">{ktpFile?.name}</span>
                                            <span class="text-xs text-emerald-600 font-medium">Foto KTP siap diunggah</span>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            class="w-full py-3 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Mengirim Pendaftaran...' : 'Daftarkan Akun'}
                        </button>
                    </form>

                    <div class="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
                        Sudah punya akun warga? 
                        <a href="/login" class="font-bold text-[#1e3a8a] hover:underline">Masuk di sini</a>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
