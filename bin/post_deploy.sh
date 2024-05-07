#!/bin/bash

NODE_ENV=${1}

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# install dependencies
npm clean-install --omit=dev

# run db migrations
NODE_ENV=${NODE_ENV} npx sequelize db:migrate

# reload application
pm2 reload ecosystem.config.js
