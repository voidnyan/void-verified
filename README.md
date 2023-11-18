Display a verified sign next to user's name in AniList.

## development

Check out [Tampermonkey's guide](https://www.tampermonkey.net/faq.php#Q402) on how to develop userscripts with an external editor.

[Nodejs](https://nodejs.org/en/) is required to build the userscript.

After cloning the repository, you can run `npm install` to install the required node packages.
After this, run `npm run dev` to rebuild the userscript when you make any file changes.
You can set Tampermonkey to use the built version `dist/voidverified.user.js`.

## configuration

Go to AniList settings > Developer & Void to change the userscript settings

### Firefox users

The script heavily uses the CSS [:has selector](https://developer.mozilla.org/en-US/docs/Web/CSS/:has). To enable this


1. `about:config` into your URL
2. search for `layout.css.has-selector.enabled`
3. set to `true`


## features

It should add the verified mark // highlight in following situations:

- home feed list activity
- home feed text activity
- directly linked list/text activity
- replies to activities
- profile text activity
- profile username
- messages

## images

![reply example](https://i.ibb.co/n720J8r/image.png)
![activity example](https://i.ibb.co/mTrSNTb/image.png)