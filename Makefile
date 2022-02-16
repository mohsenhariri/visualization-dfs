PATH := node_modules/.bin:${PATH}
SRC = ./src
DIST = ./dist
PY = python3

# ifneq (,$(wildcard ./.env))
#     include .env
#     export
# endif

ifneq (,$(wildcard ./.env.dev))
    include .env.dev
    export
endif

cert:
		openssl req -x509 -new -config ./certs/openssl.conf -out ./certs/cert.pem -keyout ./certs/key.pem

dev:
		webpack serve --config webpack.dev.js

clean:
		rm -rf $(DIST)/*

build-dev:
		webpack --config webpack.dev.js

build-prod:
		webpack --config webpack.prod.js

pyserve:
		$(PY) -m http.server --directory $(DIST)

.PHONY: all dev clean 