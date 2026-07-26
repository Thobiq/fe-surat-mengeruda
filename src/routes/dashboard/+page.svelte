<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { getTemplates, getMyRequests, submitLetterRequest, getPdfDownloadUrl } from '$lib/api.js';
    import { userStore } from '$lib/stores/auth.js';
    import StatusBadge from '$lib/components/StatusBadge.svelte';

    let user = $state(null);
    let templates = $state([]);
    let myRequests = $state([]);
    let loading = $state(true);
    let isSubmitting = $state(false);
    let activeTab = $state('ajukan'); // 'ajukan' | 'riwayat'

    // Sinkronisasi dengan sidebar URL ?tab=
    $effect(() => {
        const urlTab = $page.url.searchParams.get('tab');
        if (urlTab === 'ajukan' || urlTab === 'riwayat') {
            activeTab = urlTab;
        }
    });
    
    // Modal & Form State
    let isModalOpen = $state(false);
    let selectedTemplate = $state(null);
    let formData = $state({});
    let errorMsg = $state(null);
    let successMsg = $state(null);

    userStore.subscribe((val) => {
        user = val;
    });

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const [tempRes, reqRes] = await Promise.all([
                getTemplates(),
                getMyRequests()
            ]);
            if (tempRes?.status === 'success') templates = tempRes.data;
            if (reqRes?.status === 'success') myRequests = reqRes.data;
        } catch (e) {
            console.error('Gagal memuat data dasbor:', e);
        } finally {
            loading = false;
        }
    }

    function openNewRequestModal(template) {
        selectedTemplate = template;
        formData = {};
        errorMsg = null;
        successMsg = null;
        isModalOpen = true;
    }

    async function handleSubmitRequest(e) {
        e.preventDefault();
        if (!selectedTemplate) return;

        isSubmitting = true;
        errorMsg = null;
        successMsg = null;

        try {
            const res = await submitLetterRequest(selectedTemplate.id, formData);
            if (res.status === 'success') {
                successMsg = 'Permohonan surat berhasil diajukan!';
                await loadData();
                setTimeout(() => {
                    isModalOpen = false;
                    activeTab = 'riwayat';
                }, 1500);
            }
        } catch (e) {
            errorMsg = e.response?.data?.message || 'Gagal mengajukan surat.';
        } finally {
            isSubmitting = false;
        }
    }

    let approvedCount = $derived(myRequests.filter(r => r.status === 'approved').length);
    let pendingCount = $derived(myRequests.filter(r => r.status === 'pending').length);
</script>

<div class="space-y-8">
    <!-- Banner Verifikasi Akun -->
    {#if user && !user.is_approved}
        <div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-xs animate-fadeIn">
            <div class="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <div>
                <h3 class="font-bold text-base mb-1">Akun Dalam Proses Verifikasi Admin</h3>
                <p class="text-sm text-amber-800/90 leading-relaxed">
                    Pendaftaran akun E-Surat Anda sedang ditinjau dan dicocokkan dengan dokumen KTP yang Anda unggah. Anda baru dapat mengajukan permohonan surat setelah akun disetujui.
                </p>
            </div>
        </div>
    {/if}

    <!-- Stat Cards Warga -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Total Permohonan -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p>
                <p class="text-3xl font-extrabold text-slate-900 mt-2">{myRequests.length}</p>
                <p class="text-xs text-slate-400 mt-1">Seluruh surat saya</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            </div>
        </div>

        <!-- Card 2: Surat Disetujui -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Terbit</p>
                <p class="text-3xl font-extrabold text-emerald-600 mt-2">{approvedCount}</p>
                <p class="text-xs text-slate-400 mt-1">Siap diunduh PDF</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card 3: Sedang Ditinjau -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Diproses</p>
                <p class="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
                <p class="text-xs text-slate-400 mt-1">Verifikasi Admin</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card 4: Status Akun -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Identitas</p>
                <p class="text-lg font-extrabold text-slate-900 mt-2">
                    {user?.is_approved ? 'Terverifikasi' : 'Menunggu'}
                </p>
                <p class="text-xs text-slate-400 mt-1">Dokumen KTP</p>
            </div>
            <div class={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-inner ${user?.is_approved ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
            </div>
        </div>
    </div>

    <!-- Secondary Tab Pill -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <div class="flex items-center gap-2">
            <button 
                type="button"
                onclick={() => activeTab = 'ajukan'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'ajukan' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Ajukan Surat & Layanan</span>
            </button>
            <button 
                type="button"
                onclick={() => activeTab = 'riwayat'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'riwayat' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Riwayat Surat Saya</span>
                <span class="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-semibold">{myRequests.length}</span>
            </button>
        </div>
    </div>

    {#if activeTab === 'ajukan'}
        <!-- Pilihan Template Cepat -->
        <div class="animate-fadeIn">
            <h2 class="text-base font-bold text-slate-900 mb-4">Pilih Jenis Layanan Surat Resmi</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {#each templates as t}
                    <div 
                        onclick={() => { if (user?.is_approved) openNewRequestModal(t); }}
                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && user?.is_approved && openNewRequestModal(t)}
                        role="button"
                        tabindex="0"
                        class={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 flex flex-col justify-between ${
                            user?.is_approved 
                                ? 'cursor-pointer hover:border-[#1e3a8a] hover:shadow-lg hover:-translate-y-1' 
                                : 'opacity-60 cursor-not-allowed'
                        }`}
                    >
                        <div>
                            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">Surat Resmi</span>
                            <h3 class="font-extrabold text-slate-900 text-lg mb-2">{t.name}</h3>
                            <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">{t.description}</p>
                        </div>

                        <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1e3a8a]">
                            <span>Ajukan Sekarang</span>
                            <span class="text-sm">&rarr;</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <!-- Daftar Riwayat Pengajuan Saya -->
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 class="font-bold text-slate-900 text-base">Riwayat Permohonan Surat Saya</h2>
                <span class="text-xs text-slate-500 font-semibold">{myRequests.length} permohonan</span>
            </div>

            {#if loading}
                <div class="p-12 text-center text-slate-500">Memuat riwayat surat...</div>
            {:else if myRequests.length === 0}
                <div class="p-12 text-center">
                    <p class="text-slate-500 text-sm mb-4">Belum ada riwayat pengajuan surat.</p>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                                <th class="py-3.5 px-6">Tanggal</th>
                                <th class="py-3.5 px-6">Jenis Surat</th>
                                <th class="py-3.5 px-6">Status</th>
                                <th class="py-3.5 px-6">Keterangan</th>
                                <th class="py-3.5 px-6 text-right">Aksi / Unduh</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            {#each myRequests as req}
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="py-4 px-6 text-slate-600">
                                        {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td class="py-4 px-6 font-bold text-slate-900">
                                        {req.template?.name || 'Surat'}
                                    </td>
                                    <td class="py-4 px-6">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td class="py-4 px-6 text-slate-500 text-xs max-w-xs truncate">
                                        {req.rejection_reason || (req.status === 'approved' ? 'Telah diterbitkan dengan QR Code' : 'Dalam peninjauan')}
                                    </td>
                                    <td class="py-4 px-6 text-right">
                                        {#if req.status === 'approved'}
                                            <a 
                                                href={getPdfDownloadUrl(req.id)}
                                                target="_blank"
                                                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition-all hover-lift"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>
                                                <span>Unduh PDF</span>
                                            </a>
                                        {:else}
                                            <span class="text-xs text-slate-400 italic">-</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Modal Ajukan Surat Baru -->
{#if isModalOpen && selectedTemplate}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isModalOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup modal permohonan baru"
    >
        <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div class="bg-[#1e3a8a] px-6 py-4 text-white flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">Formulir {selectedTemplate.name}</h3>
                    <p class="text-xs text-blue-200">Isi data yang diperlukan di bawah ini</p>
                </div>
                <button 
                    type="button"
                    onclick={() => isModalOpen = false}
                    class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onsubmit={handleSubmitRequest} class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {#if errorMsg}
                    <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                        {errorMsg}
                    </div>
                {/if}
                {#if successMsg}
                    <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                        {successMsg}
                    </div>
                {/if}

                {#if selectedTemplate.required_fields && selectedTemplate.required_fields.length > 0}
                    {#each selectedTemplate.required_fields as field}
                        <div>
                            <label for={field.name} class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                {field.label} {field.required ? '*' : ''}
                            </label>
                            <input 
                                id={field.name}
                                type={field.type || 'text'}
                                bind:value={formData[field.name]}
                                placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                                required={field.required}
                            />
                        </div>
                    {/each}
                {:else}
                    <p class="text-sm text-slate-600">Tidak ada isian tambahan yang diperlukan. Klik Kirim untuk mengajukan permohonan.</p>
                {/if}

                <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        type="button"
                        onclick={() => isModalOpen = false}
                        class="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !!successMsg}
                        class="px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
