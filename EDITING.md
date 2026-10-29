# Editing the website (no coding needed)

Everything that changes season to season lives in the **`content/`** folder. You edit those files right on GitHub; the site rebuilds itself in about a minute.

**Safety net:** if an edit has a mistake, the update is rejected and the live site stays exactly as it was. You'll see a red ✗ next to your commit on GitHub; click it to read a plain-English message like:

```
Problem in content/sponsors.yaml:
  • item 3 → tier: Invalid option: expected one of "platinum"|"gold"|"silver"|"bronze"|"inkind"
```

Fix the line it names and save again.

## How to edit any file on GitHub

1. Open the repository on github.com and click the **`content`** folder.
2. Click the file (for example `sponsors.yaml`).
3. Click the **pencil icon** (Edit this file) in the top-right of the file view.
4. Make your change. Keep the same indentation (two spaces) as the lines around it.
5. Click **Commit changes…**, write a short message like "Add Acme as Gold sponsor", and click **Commit changes**.
6. Wait about a minute, then refresh tamubaja.com.

## Add a sponsor to the logo wall

Only do this after the sponsor has said yes to showing their logo.

1. Get their logo as a **PNG with a transparent background** or an **SVG**. Name it in lowercase with dashes, like `acme-gear.png`.
2. Upload it: open the **`public/sponsors`** folder → **Add file** → **Upload files** → drag the file in → **Commit changes**.
3. Edit `content/sponsors.yaml` and add a block at the end:

```yaml
- name: Acme Gear
  tier: gold
  logo: /sponsors/acme-gear.png
  url: https://www.acmegear.com
  show: true
```

`tier` must be one of `platinum`, `gold`, `silver`, `bronze`, `inkind`. In-kind gifts count at their value, so a large one goes in the matching money tier.

The Partners page shows the logo in its own colors on a white tile. The footer strip makes a matching grey version automatically on the next deploy. If the logo is **white artwork** (made for dark backgrounds), add `tile: dark` to its block so both places show it correctly.

**Never** put dollar amounts or a sponsor's contact info in these files. The repository may be public.

## Hide a sponsor

Change their `show: true` to `show: false`. Their logo disappears from every page.

## Add a competition result

Edit `content/seasons.yaml` and add a block at the **top**:

```yaml
- season: 2025–26
  event: Baja SAE Oregon
  location: Washougal, Oregon
  overall: 12
  highlights:
    - 5th Hill Climb
```

Use `overall: null` if there was no overall placing. Only add results the team has confirmed.

## Add a recent event

Edit `content/events.yaml` and add a block at the **top**. The home page shows the three newest.

```yaml
- title: Visit to Brazos Christian School
  date: 2026-10-27
  description: One or two sentences about what happened.
  photo: /images/events/brazos-visit.jpg
  morePhotos:
    - /images/events/brazos-visit-2.jpg
  link: https://www.instagram.com/p/XXXXXXXX/
```

`photo`, `morePhotos` (up to 2) and `link` are optional. Upload photos to `public/images/events/` first.

## Update the current car or next season's milestones

Edit `content/car.yaml`. Dates are written `YYYY-MM-DD`. The site marks milestones **Done / Up next / Upcoming** by itself every Monday, so you never change status by hand.

## Add or change a team lead

Get the person's OK first. Edit `content/team.yaml` under `leads:`:

```yaml
leads:
  - name: Jordan Smith
    role: Project Manager
    major: Mechanical Engineering
    classYear: "2027"
    linkedin: https://www.linkedin.com/in/jordan-smith
```

For a photo, upload a square JPG to `public/images/team/` and add `photo: /images/team/jordan-smith.jpg`. Without a photo, their initials are shown.

## Turn the "under construction" banner on or off

The amber banner above the header comes from `notice:` in `content/site.yaml`. Change the wording there, or set `show: false` to hide it (do this at launch).

```yaml
notice:
  show: false
  title: Site under construction
  message: We're still building this site, so some features may be limited or not work yet.
```

## Change the home-page stats

Edit `homeStats:` in `content/site.yaml` (up to 4). Plain numbers like `100+` or `9` count up as visitors scroll; text like `3rd` just appears.

```yaml
homeStats:
  - value: "100+"
    label: Universities we race against
  - value: 3rd
    label: Acceleration — 2025
```

## Replace the sponsor packet PDF

Upload the new PDF to `public/packet/` with the **same file name** (`tamu-baja-sponsor-packet-2026-27.pdf`), or upload it with a new name and update `packetPdf:` in `content/site.yaml`. Keep it under 5 MB.

## Change tier prices or benefits

Edit `content/tiers.yaml`. Keep the tiers in order: bronze, silver, gold, platinum.

## Change the sponsor-form email key

The form sends to the team inbox through Web3Forms. If the key ever changes, paste the new one into `web3formsKey:` in `content/site.yaml`.
