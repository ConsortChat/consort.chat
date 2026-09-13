# consort.chat

The website for [Consort](https://github.com/ConsortChat/consort-mobile),
a chat app with voice and video calls.

It's plain HTML and CSS with no build step, and it loads nothing from
other sites: no analytics, cookies, web fonts or CDNs. Each page sets a
Content-Security-Policy that blocks third-party resources, so anything
added from another host won't load. Keep it that way: self-host anything
new under `assets/`.

```
index.html          landing page and download links
privacy/index.html  privacy policy (currently a draft)
404.html            not-found page
assets/style.css    all styles; light and dark mode
assets/consort-icon.svg
```

## Preview locally

Serve the folder with any static file server, from the repository root:

```
python -m http.server 8000
```

Then open <http://localhost:8000/>. Opening `index.html` directly as a
file mostly works, but directory links like `privacy/` and the 404 page
need a server.

## Update store links

Each store is one line in the Download section of `index.html`, marked
with a `data-store` attribute. A card with no `href` is shown as
"Coming soon". To put a store live, give that line an `href`:

- **F-Droid** and **Google Play** already carry their planned URL as
  `data-href`. Rename `data-href` to `href`.
- **App Store** and **Microsoft Store** have no ID yet. Add
  `href="..."` with the URL.

For example, Google Play goes from

```html
<li><a class="store" data-store="google-play" data-href="https://play.google.com/store/apps/details?id=chat.consort.mobile">...
```

to

```html
<li><a class="store" data-store="google-play" href="https://play.google.com/store/apps/details?id=chat.consort.mobile">...
```

| Store | URL |
| --- | --- |
| F-Droid | `https://f-droid.org/packages/chat.consort.fdroid/` |
| Google Play | `https://play.google.com/store/apps/details?id=chat.consort.mobile` |
| App Store | `https://apps.apple.com/app/id<numeric ID>` |
| Microsoft Store | `https://apps.microsoft.com/detail/<Store ID>` |
| GitHub releases | `https://github.com/ConsortChat/consort-mobile/releases` (live) |

Check the F-Droid ID against `applicationId` for the `fdroid` flavor in
the app's `android/app/build.gradle` before going live.

Once a store is live, also update the sentence above the cards
("Store listings aren't live yet…").

## Publishing the privacy policy

`privacy/index.html` is converted from `docs/privacy-policy.md` in the app
repository, and is still a draft. Keep the two in step. Before publishing:

1. Finish the app changes the policy depends on (listed in the app's
   `docs/privacy.md`).
2. Replace the placeholders `[DATE]`, `[PUBLISHER NAME]` and
   `[CONTACT EMAIL]`, and remove their `class="placeholder"` spans.
3. Remove the draft notice and the `noindex` meta tag (both are marked
   with a `DRAFT` comment), and "(draft)" from the page title.
