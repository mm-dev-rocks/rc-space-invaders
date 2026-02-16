# RC Space Invaders



## Dev Overview

This is a vanilla JS project.

- Uses JSDoc types (so modern linters/IDEs will give helpful hints)
- Based on an engine I built myself from the ground up for a previous game
- I've stripped out everything unrelated to this project


Hopefully orientation will be straightforward but for a quick start:

- `main.js` App entry point
- `Game.js` Handles high-level game stuff such as loading/starting a level, scoring etc
- `Display.js` Manages all drawing operations (farming out to other classes for lower-level specifics)
- `ThingManager.js` Manages updates for all non-player in-game objects such as background stars, enemies, projectiles
- `InternalTimer.js` Manages the timer for the game loop

## Building

Really **all we need to do is bundle the JS with esbuild** (there is some minimal CSS but rarely any need to edit it).    

### esbuild  
JS  bundler, tree shaker, transpiler. I like to install a standalone build but it can also be installed with npm or other methods:  
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
For compiling and bundling SASS/SCSS:  
[SASS: Install SASS](https://sass-lang.com/install)

From the project root:

```sh
sass --watch src/scss/:www/css/
```
