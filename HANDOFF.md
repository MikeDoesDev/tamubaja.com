# Handoff checklist

Pass this to the next business lead every spring. Every account is tied to the team inbox, never a personal email.

| What | Where | Owner login | Notes |
|---|---|---|---|
| Team inbox | baja.sae.tamu@gmail.com | Business lead + project manager | Receives sponsor inquiries |
| Code | GitHub organization `tamu-baja`, repo `tamubaja.com` | Team inbox owns the org; business lead + PM are owners | Transfer ownership before graduating |
| Hosting | Vercel project `tamubaja-com` | Team inbox account | Web Analytics enabled; deploy hook used by the weekly workflow |
| Domain | tamubaja.com | Registered to the team inbox | Auto-renew ON; confirm the card on file each August |
| Form delivery | Web3Forms | Key issued to the team inbox | Key lives in `content/site.yaml` |
| Weekly rebuild | GitHub repo secret `VERCEL_DEPLOY_HOOK` | GitHub org owners | Recreate in Vercel → Settings → Git → Deploy Hooks if it stops |

## Every new season (August)
- [ ] Update `content/car.yaml` (new car specs + milestones)
- [ ] Add last season's result to `content/seasons.yaml`
- [ ] Refresh `content/sponsors.yaml` (`show: false` for sponsors who didn't renew)
- [ ] Upload the new sponsor packet
- [ ] Update `content/team.yaml` leads
- [ ] Confirm the domain auto-renew card
