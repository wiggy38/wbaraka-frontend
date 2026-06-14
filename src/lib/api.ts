import { useBarakaStore } from '@/store/barakaStore'
import type { Offre, BesoinRecherche, Simulation, SlideHero, User } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useBarakaStore.getState().token

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

// ── Endpoints comparateur ──

export async function fetchOffres(besoin: BesoinRecherche): Promise<Offre[]> {
  const params = new URLSearchParams({
    montant: String(besoin.montant),
    duree: String(besoin.duree),
    ...(besoin.activite ? { activite: besoin.activite } : {}),
    ...(besoin.ville ? { ville: besoin.ville } : {}),
  })
  const data = await apiFetch<{ success: boolean; data: Offre[] }>(
    `/offres?${params}`
  )
  return data.data
}

export async function fetchOffre(id: number): Promise<Offre> {
  const data = await apiFetch<{ success: boolean; data: Offre }>(`/offres/${id}`)
  return data.data
}

export async function fetchOffreBySlug(slug: string): Promise<Offre | null> {
  try {
    const data = await apiFetch<{ success: boolean; data: Offre | Offre[] }>(`/offres?slug=${slug}`)
    if (Array.isArray(data.data)) return data.data[0] ?? null
    return data.data ?? null
  } catch {
    return null
  }
}

export async function fetchSlider(): Promise<SlideHero[]> {
  const data = await apiFetch<{ success: boolean; data: SlideHero[] }>('/slider')
  return data.data
}

// ── Endpoints auth OTP ──

export async function requestOTP(telephone: string): Promise<void> {
  await apiFetch('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ telephone }),
  })
}

export async function verifyOTP(telephone: string, code: string) {
  const data = await apiFetch<{ success: boolean; token: string; user: User }>(
    '/auth/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify({ telephone, code }),
    }
  )
  return data
}

// ── Endpoints favoris (auth requis) ──

export async function fetchFavoris(): Promise<Offre[]> {
  const data = await apiFetch<{ success: boolean; data: Offre[] }>('/compte/favoris')
  return data.data
}

export async function ajouterFavoriAPI(offreId: number): Promise<void> {
  await apiFetch('/compte/favoris', {
    method: 'POST',
    body: JSON.stringify({ offre_id: offreId }),
  })
}

export async function supprimerFavoriAPI(offreId: number): Promise<void> {
  await apiFetch(`/compte/favoris/${offreId}`, { method: 'DELETE' })
}

// ── Endpoints simulateur ──

export async function saveSimulation(sim: {
  offre_id: number
  montant: number
  duree: number
  teg: number
  mensualite: number
  cout_total: number
}): Promise<{ id: number }> {
  const data = await apiFetch<{ success: boolean; data: { id: number } }>(
    '/simulations',
    {
      method: 'POST',
      body: JSON.stringify(sim),
    }
  )
  return data.data
}

export async function fetchSimulations(): Promise<Simulation[]> {
  const data = await apiFetch<{ success: boolean; data: Simulation[] }>('/simulations')
  return data.data
}

export async function deleteSimulation(id: number): Promise<void> {
  await apiFetch(`/simulations/${id}`, { method: 'DELETE' })
}
