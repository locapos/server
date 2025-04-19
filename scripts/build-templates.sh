#!/bin/sh

npx pug --out ./dist templates/index.pug
npx pug --out ./dist/oauth templates/oauth/_authorize.pug
npx pug --out ./dist/oauth templates/oauth/_failed.pug
npx pug --out ./dist/oauth templates/oauth/_redirect.pug