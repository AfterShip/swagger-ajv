#!/bin/sh

# If token does exist, create it within CACHE_DIR
if [ ! -f "$CACHE_DIR/token" ]; then
	mkdir -p $CACHE_DIR
	echo "$NPM_AUTH_TOKEN" > $CACHE_DIR/token
fi
# Create .npmrc
echo "//registry.npmjs.org/:_authToken=$(cat $CACHE_DIR/token)" > ./.npmrc

yarn install --no-optional --pure-lockfile > /dev/null
