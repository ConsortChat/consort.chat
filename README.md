# consort.chat

The website for Consort: open-source team chat with voice and video calls
built in. It markets the server software and hosts downloads for the
desktop and mobile apps.

It's plain HTML and CSS with no build step, and it loads nothing from
other sites: no analytics, cookies, web fonts or CDNs. Each page sets a
Content-Security-Policy that blocks third-party resources, so anything
added from another host won't load. Keep it that way: self-host anything
new under `assets/`.

```
index.html                 home: what Consort is
server/index.html          self-hosting guide
download/index.html        desktop and mobile downloads
privacy/index.html         privacy overview: website, servers, apps
privacy/mobile/index.html  mobile app privacy policy (currently a draft)
404.html                   not-found page (root-relative links)
assets/style.css           all styles; light and dark mode
assets/consort-logo.svg    brand files, copied from Consort's brand/
assets/favicon.svg
assets/media/              demo media, copied from Consort's docs/
```

There's no templating, so the header and footer are repeated on every
page. Change them everywhere at once.

## Preview locally

Serve the folder with any static file server, from the repository root:

```
python -m http.server 8000
```

Then open <http://localhost:8000/>. Opening the files directly mostly
works, but directory links like `download/` and the 404 page need a
server.

## Source repositories

| | Repository |
| --- | --- |
| Server | https://github.com/Dyslectric/Consort |
| Desktop app | https://github.com/Dyslectric/Consort-Desktop |
| Mobile app | https://github.com/ConsortChat/consort-mobile |

If a repository moves, search the site for its URL: it appears in every
footer, and in `server/` and `download/`.

The logo, favicon and demo media are copied from the server repository
(`brand/`, `docs/` and `docs/demo-avatars/`). Don't edit them here;
regenerate them there and copy them again.

The home page hero is an HTML and CSS mockup of the desktop app, not a
screenshot, so it stays sharp and has no real people's names or avatars
in it. Its people and messages are made up. When the app's look changes,
update the mockup in `index.html` (the `.stage` block) and its styles in
`assets/style.css` (under "Hero").

## Update download links

Each download is one line in `download/index.html`, marked with a
`data-store` attribute. A card with no `href` is shown as "Coming soon".
To put one live, give that line an `href`:

- **F-Droid**, **Google Play** and **Android APK** already carry their
  planned URL as `data-href`. Rename `data-href` to `href`.
- **App Store**, **Microsoft Store** and **macOS** have no URL yet. Add
  `href="..."`.

For example, Google Play goes from

```html
<li><a class="store" data-store="google-play" data-href="https://play.google.com/store/apps/details?id=chat.consort.mobile">...
```

to

```html
<li><a class="store" data-store="google-play" href="https://play.google.com/store/apps/details?id=chat.consort.mobile">...
```

| Download | URL | Status |
| --- | --- | --- |
| Windows | `https://github.com/Dyslectric/Consort-Desktop/releases/latest` | live |
| Linux | `https://github.com/Dyslectric/Consort-Desktop/releases/latest` | live |
| Microsoft Store | `https://apps.microsoft.com/detail/<Store ID>` | coming soon |
| macOS | a release asset, once one is built | coming soon |
| F-Droid | `https://f-droid.org/packages/chat.consort.fdroid/` | coming soon |
| Google Play | `https://play.google.com/store/apps/details?id=chat.consort.mobile` | coming soon |
| App Store | `https://apps.apple.com/app/id<numeric ID>` | coming soon |
| Android APK | `https://github.com/ConsortChat/consort-mobile/releases/latest` | coming soon (no releases yet) |

Check the F-Droid ID against `applicationId` for the `fdroid` flavor in
the mobile app's `android/app/build.gradle` before going live.

When the first mobile download goes live, also change the Mobile card's
"Coming soon" link on the home page.

## Privacy policies

`privacy/index.html` lists one policy per app. A desktop app policy is
planned; when it exists, add it as `privacy/desktop/index.html` (copy the
mobile page's structure) and link it from the list.

`privacy/mobile/index.html` is converted from `docs/privacy-policy.md` in
the mobile app repository, and is still a draft. Keep the two in step.
Before publishing:

1. Finish the app changes the policy depends on (listed in the app's
   `docs/privacy.md`).
2. Replace the placeholders `[DATE]`, `[PUBLISHER NAME]` and
   `[CONTACT EMAIL]`, and remove their `class="placeholder"` spans.
3. Remove the draft notice and the `noindex` meta tag (both are marked
   with a `DRAFT` comment), and "(draft)" from the page title and from
   the list in `privacy/index.html`.

The "This website" section of `privacy/index.html` mentions server logs
in general terms. Update it once hosting is chosen.
