# Sponsor portal setup

The sponsor portal (`/sponsor-portal`) lets approved sponsors and team members sign in with Google or Microsoft. Inside, they see:

- **Season calendar**: upcoming milestones from `content/car.yaml`. Notes meant for the viewer's tier are tagged "For you", and every date has an "Add to calendar" link. Team members see every tier's notes.
- **Partnership benefits** (sponsors only): everything their tier includes, from `content/tiers.yaml`.
- **Meet the team**: headshots, names, majors, years, subteams, and LinkedIns for members who opted in. Resume downloads are for the team and for sponsors at the tier whose benefits mention the resume bank (Silver today). Bronze sponsors see a note about upgrading.

The public site shows only names, majors, and class years, plus group and event photos. Individual headshots, LinkedIns, and resumes appear only here. Until the steps below are done, the page says sign-in isn't switched on and the "Sponsor login" button on `/sponsors` stays hidden.

Set everything up while signed in as **tamubajabusiness@gmail.com**, so the accounts stay with the team.

## 1. Session secret

Generate a random secret (any one of these):

- On a computer with Node: `npx auth secret` (prints `AUTH_SECRET=...`)
- Or: `openssl rand -base64 33`

This becomes `AUTH_SECRET`. Keep it private, and never commit it.

## 2. Google sign-in

1. Go to https://console.cloud.google.com and create a project named **TAMU Baja Website**.
2. Open **Google Auth Platform** (also listed as APIs & Services → OAuth consent screen) and click **Get started**:
   - App name: `Texas A&M Baja SAE`
   - User support email: tamubajabusiness@gmail.com
   - Audience: **External**
   - Contact email: tamubajabusiness@gmail.com
3. **Branding**: set the home page to `https://www.tamubaja.com` and add `tamubaja.com` under Authorized domains.
4. **Audience**: click **Publish app** so the status is **In production**. While it says "Testing", only test users you list can sign in. The site asks only for name and email, so Google doesn't require a review.
5. **Clients → Create client → Web application**, named `tamubaja.com`:
   - Authorized JavaScript origins: `https://www.tamubaja.com` and `https://tamubaja.com`
   - Authorized redirect URIs: `https://www.tamubaja.com/api/auth/callback/google` and `https://tamubaja.com/api/auth/callback/google`
   - Optional, for local testing: `http://localhost:3000/api/auth/callback/google`
6. Copy the **Client ID** into `AUTH_GOOGLE_ID` and the **Client secret** into `AUTH_GOOGLE_SECRET`.

## 3. Microsoft sign-in

You can leave Microsoft for later. Google works on its own, and the Microsoft button appears only once its keys are set.

1. Go to https://entra.microsoft.com. If the Baja Gmail doesn't have a Microsoft account yet, create one at https://account.microsoft.com and choose "use your existing email."
   - Microsoft requires an Entra directory to register apps. If the portal says you don't have one, sign up for a free Azure account with that same login. It may ask for a card to verify identity. App registrations are free.
2. **App registrations → New registration**:
   - Name: `Texas A&M Baja SAE`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: platform **Web**, `https://www.tamubaja.com/api/auth/callback/microsoft-entra-id`
3. Then under **Authentication**, add the second redirect URI: `https://tamubaja.com/api/auth/callback/microsoft-entra-id`.
4. From **Overview**, copy the **Application (client) ID** into `AUTH_MICROSOFT_ENTRA_ID_ID`.
5. **Certificates & secrets → New client secret** (24 months). Copy the **Value** (not the Secret ID) into `AUTH_MICROSOFT_ENTRA_ID_SECRET`. Put a reminder on the team calendar for the expiry date. When it expires, Microsoft sign-in stops working until you make a new secret.
6. **Token configuration → Add optional claim → ID**, check **email** and **xms_edov**, then save. If it asks to turn on the Microsoft Graph email permission, say yes.
   - This step matters. `xms_edov` is how the site knows a company actually owns the email domain on a work account. Without it, every work-account sign-in is refused.
7. Optional: set `AUTH_MICROSOFT_ENTRA_ID_ISSUER` to `https://login.microsoftonline.com/common/v2.0`. That's already the default.

Known limit: some companies don't let employees sign in to outside apps without IT approval. Those people will see "Need admin approval" from Microsoft. They can use "Continue with Google" instead (anyone can create a Google account for their work address), or email us.

## 4. Add the variables in Vercel

1. In Vercel, open the **tamubaja-com** project → **Settings → Environment Variables**.
2. Add each variable for the **Production** environment:

| Name | Value |
|---|---|
| `AUTH_SECRET` | from step 1 |
| `AUTH_GOOGLE_ID` | Google client ID |
| `AUTH_GOOGLE_SECRET` | Google client secret |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Microsoft application (client) ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Microsoft client secret value |

3. **Deployments** → the latest deployment → **⋯ → Redeploy**. New variables only take effect on a new deploy.

## 5. Test it

1. Go to https://www.tamubaja.com/sponsors. The **Sponsor login** button should now appear under the hero buttons.
2. Sign in with Google as tamubajabusiness@gmail.com. You should see the three sample profiles, and the resume download should give you a one-page placeholder PDF.
3. Sign out, then sign in with any other account. You should see "This page is for Texas A&M Baja sponsors."

## Adding and removing sponsors

Edit `content/sponsor-access.yaml` (instructions are at the top of the file and in EDITING.md). Changes apply as soon as the site redeploys, about a minute after you commit.

## 6. Connect the private team sheet (team login, real profiles)

Until this is done, the portal shows three sample profiles and only the sponsor list can sign in.

**The sheet.** Make one Google Sheet in the Baja Drive with a tab named **Roster**. The member form's response sheet works if you rename its tab to Roster, or set `TEAM_SHEET_TAB` to its tab name. Row 1 is headers, in any order. Use these names:

| Header | What goes in it |
|---|---|
| Name | Full name (required) |
| Email | Their TAMU email |
| Sign-in email | Optional. The address they'll sign in with if it's different, like a personal Gmail |
| Major | |
| Class year | 4-digit year |
| Subteam | |
| LinkedIn | Full https://linkedin.com/in/... link |
| Share with sponsors | Yes or No. Only "Yes" people appear in the portal |
| Headshot | Google Drive link to their photo |
| Resume | Google Drive link to their PDF |

Everyone with an email on this sheet can sign in as a team member, whether or not they said Yes to sharing. To remove someone's access, delete their row. The site re-reads the sheet every 5 minutes.

TAMU email runs on Microsoft, and TAMU IT may block outside apps from Microsoft sign-in. Have team members put a personal Gmail in **Sign-in email** and use "Continue with Google".

**The service account** (the robot account the site uses to read the sheet):

1. In the same Google Cloud project as step 2, open **APIs & Services → Library** and enable the **Google Sheets API** and the **Google Drive API**.
2. **IAM & Admin → Service accounts → Create service account**, named `tamubaja-site`. Skip the optional role steps.
3. Open it → **Keys → Add key → Create new key → JSON**. A file downloads. Treat it like a password and don't commit it.
4. **Share** the sheet, the headshot folder, and the resume folder with the service account's email (it looks like `tamubaja-site@<project>.iam.gserviceaccount.com`), as **Viewer**. If a form collects the uploads, share the form's upload folder.
5. Add these to Vercel (Production), then redeploy:

| Name | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON file |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `private_key` from the JSON file, the whole thing including the BEGIN/END lines |
| `TEAM_SHEET_ID` | The long ID in the sheet's URL, between `/d/` and `/edit` |
| `TEAM_SHEET_TAB` | Optional. The tab name, if it isn't `Roster` |

Some Google Cloud accounts block service-account keys by default ("key creation is disabled"). That usually only happens on school or company accounts, not the Baja Gmail. If you see it, tell whoever's helping with the site.

## Calendar notes for each tier

In `content/car.yaml`, a milestone's `sponsorNote` shows in the portal calendar. Add `forTiers: [platinum]` (or several tiers) when the note is only for some tiers. Leave it out when it's for every sponsor.

## Why a public GitHub repo is still safe

- Secrets (the sign-in keys, session secret, and service-account key) live only in Vercel's environment variables. Reading the code doesn't help anyone forge a sign-in.
- The sponsor list in the repo holds only company names and email domains. Getting in still takes a verified account at one of those domains.
- Member details, headshots, resumes, and team emails stay in the private sheet and Drive. They're served only to signed-in, approved viewers, and never from `public/`.
