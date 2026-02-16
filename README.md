# RC Space Invaders



## Dev Overview

This is a vanilla JS project.

- Uses JSDoc types (types in comments so modern linters/IDEs will give helpful hints)
- Based on an engine I built myself from the ground up for a previous game
- I've stripped out everything unrelated to this project


Hopefully orientation will be straightforward but for a quick start:


### `/src/` directory

- `main.js` App entry point
- `Game.js` Handles high-level game stuff such as loading/starting a level, scoring etc
- `Display.js` Manages all drawing operations (farming out to other classes for lower-level specifics)
- `ThingManager.js` Manages updates for all non-player in-game objects such as background stars, enemies, projectiles
- `InternalTimer.js` Manages the timer for the game loop


### `/000-ASSETS/` directory

Files used during dev eg:
- Krita (image editor) project files
- Shell scripts to merge images into sprite sheets


### `/src/RCSI/` directory

Constants for configuring the game eg:
- Strings for display text
- Variables to tune player size/movement speed


## Building

**All we need to do is bundle the JS with esbuild**

### esbuild  
JS bundler/tree shaker/transpiler. 

I install a standalone build but there are other ways eg `npm install --save-exact --save-dev esbuild`:  
[esbuild: Download a build](https://esbuild.github.io/getting-started/#download-a-build)

From the project root:

```sh
esbuild src/main.js \
    --outfile=www/js/rc-space-invaders.js \
    --target=es6 \
    --global-name=RcSpaceInvaders \
    --watch \
    --servedir=www \
    --bundle \
    --minify \
    --sourcemap 
```


### SASS  

**CSS is minimal and there's rarely any need to edit it**

For compiling and bundling SASS/SCSS:  
[SASS: Install SASS](https://sass-lang.com/install)

From the project root:

```sh
sass --watch src/scss/:www/css/
```
