#!/bin/sh

# Open a JS project using esbuild, SASS and nvim

WORK_DIR="$HOME"/000-WORK/rc-space-invaders/

'tmux' \
    new-window -c "$WORK_DIR" "esbuild src/main.js --outfile=www/js/rc-space-invaders.js --target=es6 --bundle --minify --sourcemap --global-name=RcSpaceInvaders --format=iife --watch" \; \
    split-window -c "$WORK_DIR" "sass --watch src/scss/:www/css/" \; \
    split-window -c "$WORK_DIR" "git status; bash -i" \; \
    split-window -c "$WORK_DIR" "python -m http.server --directory www/" \; \
    select-layout even-vertical \; \
    new-window -c "$WORK_DIR" "nvim -S vim.Session" \; \
