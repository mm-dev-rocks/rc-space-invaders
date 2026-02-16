# BUGS

## Require a tap to start
- Currently using space key, but this only works if the viewport has focus
- A tap will bring focus (2 birds 1 stone) 
- If sound is added in future, a user interaction (eg tap) is required before browser allows audio

## Outermost enemies fall out of line
- When the group of enemies 'bounces' off the side wall, the first enemy to touch the wall slips out of position
- Less obvious at first but the effect grows incrementally with each bounce


# Features

## Bullets

- Add new `THING_TYPE.PROJECTILE`
- Make sure `Display.js` draws them in same way as other `THING_TYPE`s
- `ThingManager.js` to spawn them
- `ThingManager.js` to update them
    - Move up each frame
    - Check for collision with enemies


## Scoring

- `Game.currentScore` already exists in `Game.js`
- Hardcoded at 12345 currently
- If the value is changed, `Display.js` will automatically pick it up on next redraw


# README

# Comments


# First Level
Prepare concept of bullets

# CSS
