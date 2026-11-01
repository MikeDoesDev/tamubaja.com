# Handoff checklist

Pass this to the next business lead every spring. Every account is tied to the team inbox, never a personal email.

| What | Where | Owner login | Notes |
|---|---|---|---|
| Team inbox | tamubajabusiness@gmail.com (public contact; replaced baja.sae.tamu@gmail.com in Oct 2026) | Business lead + project manager | Receives sponsor inquiries |
| Code | GitHub organization `tamu-baja`, repo `tamubaja.com` | Team inbox owns the org; business lead + PM are owners | Transfer ownership before graduating |
| Hosting | Vercel project `tamubaja-com` | Team inbox account | Web Analytics enabled; deploy hook used by the weekly workflow |
| Domain | tamubaja.com | Registered to the team inbox | Auto-renew ON; confirm the card on file each August |
| Form delivery | Web3Forms | Key issued to the team inbox | Key lives in `content/site.yaml` |
| Sponsor portal: Google sign-in | Google Cloud project "TAMU Baja Website" | Team inbox | Client ID/secret in Vercel env vars; see docs/sponsor-portal.md |
| Sponsor portal: Microsoft sign-in | Microsoft Entra app registration "Texas A&M Baja SAE" | Team inbox | Client secret expires every 24 months: make a new one and update Vercel |
| Weekly rebuild | GitHub repo secret `VERCEL_DEPLOY_HOOK` | GitHub org owners | Recreate in Vercel → Settings → Git → Deploy Hooks if it stops |

## Before launch (one time)
- [ ] Give page steps now match the 26-27 packet ("Student Organization Gifts" + code 511361-20000 in gift notes); confirm once with a test visit to the Foundation page
- [ ] Confirm the 2025–26 result (add to `content/seasons.yaml`, or leave it out)
- [ ] Agree on founding wording (2017 vs 2018) in `content/team.yaml` and `content/site.yaml`
- [ ] Sponsors who approved their logo → upload logo, set `show: true`
- [ ] Leads who agreed to be listed → `content/team.yaml`
- [ ] Photo rights confirmed for everything in `public/images/`
- [ ] Web3Forms key in `content/site.yaml`; one real test inquiry received
- [ ] Domain bought and connected; `VERCEL_DEPLOY_HOOK` secret added
- [ ] Turn off the "under construction" banner: `content/site.yaml` → `notice` → `show: false`

## Every new season (August)
- [ ] Update `content/car.yaml` (new car specs + milestones)
- [ ] Add last season's result to `content/seasons.yaml`
- [ ] Refresh `content/sponsors.yaml` (`show: false` for sponsors who didn't renew)
- [ ] Upload the new sponsor packet
- [ ] Update `content/sponsor-access.yaml` (remove sponsors who didn't renew)
- [ ] Update `content/team.yaml` leads
- [ ] Confirm the domain auto-renew card
- [ ] GitHub → Actions → Weekly redeploy: if it shows "disabled" (GitHub pauses scheduled jobs after 60 quiet days), click Enable workflow
