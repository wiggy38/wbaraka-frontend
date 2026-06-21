import { useBarakaStore } from '@/store/barakaStore'
import type { Offre, BesoinRecherche, Simulation, SlideHero, User } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// ── Format brut retourné par le backend ──

interface OffreBackend {
  id_offre: string
  id_imf: string
  nom_produit: string
  taux_interet_mensuel: string | number
  montant_min: number
  montant_max: number
  duree_min_mois: number
  duree_max_mois: number
  frais_dossier: string | number | null
  assurance: string | number | null
  garantie_requise: string
  delai_traitement_jours: number
  cible_specifique: string[] | null
  zones_couverture: string[]
  statut: string
  imf?: {
    id: string
    nom: string
    ville?: string
    logo_url: string | null
    cover_url: string | null
    cover_gradient?: string
    rating?: number
    agrément_bceao?: string
  }
}

const GARANTIE_LABELS: Record<string, string> = {
  aucune: 'Sans garantie',
  caution: 'Caution solidaire',
  neant: 'Sans garantie',
  bien: 'Bien immobilier',
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #0D5934 0%, #2A9D6E 100%)',
  'linear-gradient(135deg, #1B6B44 0%, #D4A017 120%)',
  'linear-gradient(140deg, #0D5934 0%, #7C3AED 130%)',
  'linear-gradient(135deg, #1a5276 0%, #2ecc71 100%)',
]

function mapOffreBackend(raw: OffreBackend, besoin: BesoinRecherche, index: number): Offre {
  const taux = parseFloat(String(raw.taux_interet_mensuel))
  const frais = raw.frais_dossier ? parseFloat(String(raw.frais_dossier)) : 0
  const teg = parseFloat((((1 + taux / 100) ** 12 - 1) * 100).toFixed(1))

  const r = taux / 100
  const n = besoin.duree
  const P = besoin.montant
  const mensualite = r === 0
    ? Math.round(P / n)
    : Math.round(P * r / (1 - Math.pow(1 + r, -n)))
  const cout_total = Math.round(mensualite * n + frais)

  const slug = raw.nom_produit
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  return {
    id: raw.id_offre as unknown as number,
    imf: {
      id: raw.id_imf as unknown as number,
      slug,
      nom: raw.imf?.nom ?? `IMF ${raw.id_imf}`,
      ville: raw.imf?.ville ?? raw.zones_couverture[0] ?? 'Burkina Faso',
      logo_url: raw.imf?.logo_url ?? null,
      cover_url: raw.imf?.cover_url ?? null,
      cover_gradient: COVER_GRADIENTS[index % COVER_GRADIENTS.length],
      rating: raw.imf?.rating ?? 0,
      agrément_bceao: raw.imf?.agrément_bceao ?? 'N/A',
    },
    taux_mensuel: taux,
    teg_annuel: teg,
    montant_min: raw.montant_min,
    montant_max: raw.montant_max,
    duree_min: raw.duree_min_mois,
    duree_max: raw.duree_max_mois,
    mensualite_estimee: mensualite,
    cout_total,
    frais_dossier: frais,
    objet: raw.cible_specifique ?? [],
    garanties: [GARANTIE_LABELS[raw.garantie_requise] ?? raw.garantie_requise],
    delai_traitement: `${raw.delai_traitement_jours} jours`,
    statut: raw.statut as Offre['statut'],
    is_best: false,
    is_sponsored: false,
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useBarakaStore.getState().token
console.log('=================='); 
console.log(token); 
console.log('====================================='); 
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

export async function  fetchOffres(besoin: BesoinRecherche): Promise<Offre[]> {
  const params = new URLSearchParams({
    montant: String(besoin.montant),
    duree: String(besoin.duree),
    ...(besoin.activite ? { activite: besoin.activite } : {}),
    ...(besoin.ville ? { ville: besoin.ville } : {}),
  })
  const data = await apiFetch<{ success: boolean; data: { data: OffreBackend[] } | OffreBackend[] }>(
    `/offres?${params}`
  )
  console.log('Raw API response for offres:', data) // Debug log to check the raw API response
  const raw: OffreBackend[] = Array.isArray(data.data)
    ? data.data
    : Array.isArray((data.data as { data: OffreBackend[] }).data)
      ? (data.data as { data: OffreBackend[] }).data
      : []
  return raw.map((item, i) => mapOffreBackend(item, besoin, i))
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
  const res = await fetch(`${BASE_URL}/admin/slider`, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  const data: { success: boolean; data: SlideHero[] } = await res.json()
  return data.data
}

// ── Endpoints auth OTP ──

export async function requestOTP(telephone: string): Promise<void> {
  console.log('Requesting OTP for:', telephone)
  await apiFetch('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ telephone }),
  })
}

export async function verifyOTP(telephone: string, code: string) {
  console.log('Verifying OTP for:', telephone)
  const res = await apiFetch<{
    success: boolean
    token?: string
    user?: User
    data?: { token: string; user: User }
  }>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ telephone, code }),
  })
  console.log('OTP verification response:', res)
  return {
    token: res.token ?? res.data?.token ?? '',
    user: res.user ?? res.data?.user,
  }
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

export async function savePrenom(nom: string): Promise<void> {
  await apiFetch('/auth/me/nom', {
    method: 'PUT',
    body: JSON.stringify({ nom }),
  })
}
