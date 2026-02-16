# RC Space Invaders



## Development Environment

Really all we need to do is bundle the JS with esbuild (there is some minimal CSS but rarely a need to edit it).    

### esbuild  
JS  bundler, tree shaker, transpiler. I like to install a standalone build but it can also be installed with npm or other methods:  
[esbuild: Download a build](https://esbuild.github.io/getting-started/#download-a-build)

From the project root:

```sh
esbuild src/main.js --outfile=www/js/rc-space-invaders.js --target=es6 --bundle --minify --sourcemap --global-name=RcSpaceInvaders --format=iife --watch --servedir=www
```


### SASS  
For compiling and bundling SASS/SCSS:
[SASS: Install SASS](https://sass-lang.com/install)

From the project root:

```sh
sass --watch src/scss/:www/css/
```
