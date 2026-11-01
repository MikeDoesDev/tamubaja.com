# Sponsor portal setup

The sponsor portal (`/sponsor-portal`) lets approved sponsors sign in with Google or Microsoft and see member profiles and resumes. Until the steps below are done, the page says sign-in isn't switched on and the "Sponsor login" button on `/sponsors` stays hidden.

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

## Where member data will live

This repository is public, so real member profiles, headshots, and resumes must never be committed. Right now `src/lib/portalMembers.ts` returns three made-up profiles. The plan for real data is to read it from private storage, using keys kept in Vercel environment variables. The likely setup is the private Google Sheet the member form already fills, plus the team Drive resume folder, both shared with a Google service account. The site will show only members who opted in on the form.
