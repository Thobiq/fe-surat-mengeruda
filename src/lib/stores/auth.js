import { writable } from 'svelte/store';
import { getCurrentUser } from '$lib/api.js';

export const userStore = writable(null);
export const isLoadingAuth = writable(true);

export async function fetchAuthUser() {
    isLoadingAuth.set(true);
    try {
        const res = await getCurrentUser();
        if (res?.status === 'success' && res.data) {
            userStore.set(res.data);
            return res.data;
        }
    } catch (e) {
        userStore.set(null);
    } finally {
        isLoadingAuth.set(false);
    }
    return null;
}
