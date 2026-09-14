# genomatch.app static legal pages

Host the contents of `public/` at the site root so these URLs work:

- `/privacy` or `/privacy.html`
- `/terms` or `/terms.html`
- `/support` or `/support.html`
- `/.well-known/apple-app-site-association` (no file extension; `application/json`)

Replace `REPLACE_WITH_APPLE_TEAM_ID` in the AASA file after Apple Developer membership is approved and you have a Team ID.

The iOS app also shows Privacy and Terms in-app, so App Review does not depend on the live site remaining up.
