# VoidVerified

VoidVerified is a userscript that adds social, editor, navigation, and customization tools to [AniList](https://anilist.co).

The script runs on `https://anilist.co/*` and is built for Tampermonkey-compatible userscript managers.

## Installation

Install the published userscript from Greasy Fork:

[VoidVerified on Greasy Fork](https://greasyfork.org/en/scripts/475531-voidverified)

Additional setup notes are available on:

[voidnyan.net/docs/getting-started](https://voidnyan.net/docs/getting-started)

## Configuration

VoidVerified adds its own settings panel to AniList under:

`AniList Settings > Developer & Void`

Most features are opt-in. Some features require AniList authorization, and some sync or hosted features require VoidVerified API authorization. The settings page marks which options need each authorization type.

Configuration can also be imported and exported from the VoidVerified settings panel.

## Features

### User Styling

- Display a custom verified sign next to usernames and profile names.
- Maintain a configurable list of verified users.
- Copy a user's AniList profile color into VoidVerified styling.
- Highlight activities and replies from configured users.
- Color user activity and reply links.
- Add a Quick Access user panel to the home page, including change badges and refresh timing.
- Preview users with a mini profile card on hover.

### Activity And Feed Tools

- Move activity subscribe buttons next to comments and likes.
- Hide activity and reply like counts.
- Add a button for publishing a private message to yourself from your profile.
- Fix AniList's list feed behavior where private messages can appear in the list activity feed.
- Add instant replies for activity updates in the home feed.
- Add collapsible replies, remember collapsed replies, and auto-collapse liked replies or your own replies.
- Add reply-to selection for activities and replies.
- Add direct links to replies and scroll directly to a reply when a reply id is present in the URL.
- Replace activity timestamp tooltips with locale-formatted tooltips.
- Preview direct image links on hover.
- Replace embedded videos with links as a mobile compatibility fix.
- Add polls to activities and support voting on polls through VoidVerified API.
- Add a message feed filter to the home page.

### Editor And Media Tools

- Wrap pasted image links in AniList image markdown.
- Wrap pasted images with links and control pasted image width.
- Upload clipboard images to an image host before inserting them.
- Supported image hosts: Catbox, ImgBB, and Imgur.
- Add a GIF keyboard to activity editors.
- Add like buttons that save media to the GIF keyboard.
- Sync GIFs and images between devices through VoidVerified API.
- Enable markdown editor hotkeys.
- Add a markdown taskbar to activity editors.
- Add quote actions for selected text.

### Navigation And Search

- Enable VoidVerified QuickStart, opened by default with `ctrl+space`.
- Use QuickStart to search Quick Access users, notifications, AniList pages, and VoidVerified settings.
- Search activities from QuickStart.
- Add QuickStart navigation buttons.
- Open AniList links in the same tab instead of a new tab.

### Notifications

- Replace AniList's notification feed.
- Add quick access notifications to the home page.
- Sync read notifications between devices through VoidVerified API.

### Customization

- Add custom global CSS.
- Use the layout designer from the settings panel.
- Configure toast notifications.
- Configure local time formatting.
- Show a changelog after updates.
- Temporarily pause AniList API requests after repeated errors.

## Development

Install dependencies:

```sh
npm install
```

Build the production userscript:

```sh
npm run build
```

Build in development mode with file watching and LiveReload:

```sh
npm run dev
```

Run tests:

```sh
npm test
```

Version helper scripts are available:

```sh
npm run patch
npm run minor
```

The production build is written to `dist/index.prod.user.js`. The development build creates `dist/index.dev.user.js`, which loads `dist/index.debug.js` from the local filesystem.

## License

MIT
