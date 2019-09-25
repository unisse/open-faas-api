#!/bin/sh
                                                                      
mkdir secrets

ssh-keygen -t rsa -N "" -b 4096 -m PEM -f secrets/jwtRS256.key

openssl rsa -in secrets/jwtRS256.key -pubout -outform PEM -out secrets/jwtRS256.key.pub

openssl rand -base64 64 > secrets/password-secret.txt

openssl rand -base64 64 > secrets/internal-secret.txt

docker secret create jwtRS256.key secrets/jwtRS256.key

docker secret create jwtRS256.key.pub secrets/jwtRS256.key.pub

docker secret create password-secret secrets/password-secret.txt

docker secret create internal-secret secrets/internal-secret.txt

docker stack deploy func --compose-file docker-compose.yml
