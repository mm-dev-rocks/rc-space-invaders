#!/bin/sh

# Imagemagick command to tile all pngs in directory into a single vertical file


convert *.png -append sprites.png
