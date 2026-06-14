# Déploiement Baraka Frontend

## Variables Vercel (Settings → Environment Variables)

| Variable | Valeur prod | Description |
|---|---|---|
| NEXT_PUBLIC_API_URL | https://api.tiviana.fr/api/v1 | URL API Laravel |
| NEXT_PUBLIC_CDN_URL | https://cdn.tiviana.fr | CDN Cloudflare R2 |

## Déploiement

1. Push sur `main` → déploiement automatique Vercel
2. Preview URL disponible sur chaque PR
3. Domaine custom : tiviana.fr (à configurer dans Vercel DNS)

## Checklist avant mise en ligne

- [ ] NEXT_PUBLIC_API_URL pointe vers Railway prod
- [ ] HTTPS activé (auto Vercel)
- [ ] PWA testée sur Android Chrome
- [ ] Lighthouse mobile ≥ 85 sur tiviana.fr
- [ ] Test OTP réel avec Africa's Talking prod
- [ ] 5 offres IMF réelles saisies en base
