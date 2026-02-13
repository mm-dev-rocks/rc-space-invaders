# RC Space Invaders


## Play


## Development Environment

### Dependencies
    

### esbuild  
JS  bundler, tree shaker, transpiler. I like to install a standalone build but it can also be installed with npm or other methods:  
[esbuild: Download a build](https://esbuild.github.io/getting-started/#download-a-build)


### SASS  
For compiling and bundling SASS/SCSS:
[SASS: Install SASS](https://sass-lang.com/install)


### Example of Project Setup Using Tmux/Vim  

Below is an example build script which does the following:

- Change to the project directory
- Use `tmux` to open a few window panes:
 
    0. **esbuild** watching for changes to **JS**
    0. **SASS** watching for changes to **CSS**
    0. **git** status, pane left open for commits etc
    0. A simple **Python server** so we can test the app in a browser
- Open a **vim** session for file **editing**


```bash

#!/bin/bash

# Open a JS project using esbuild, SASS and vim

WORK_DIR="$HOME"/000-WORK/rc-space-invaders/

'tmux' \
    new-window -c "$WORK_DIR" "esbuild src/main.js --outfile=www/js/rc-space-invaders.js --target=es6 --bundle --minify --sourcemap --global-name=PIPEDREAM --format=iife --watch" \; \
    split-window -c "$WORK_DIR" "sass --watch src/scss/:www/css/" \; \
    split-window -c "$WORK_DIR" "git status; bash -i" \; \
    split-window -c "$WORK_DIR" "python -m http.server --directory www/" \; \
    select-layout even-vertical \; \
    new-window -c "$WORK_DIR" "vim -S vim.Session" \; \
```


