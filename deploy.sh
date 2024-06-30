#!/bin/bash

REMOTE="erwan@90.195.67.190"
TARGET_FOLDER="nodejs"
GRUNT_ARG="deploy"
NODE_ENV="production"

# lint
npm run check

# build
NODE_ENV=${NODE_ENV} npx grunt ${GRUNT_ARG}

# copy files
rsync -urv dist/* dist/.sequelizerc package.json package-lock.json ${REMOTE}:${TARGET_FOLDER}/dist

# run post_deploy script
ssh "${REMOTE}" "cd ${TARGET_FOLDER} && bash ./bin/post_deploy.sh ${NODE_ENV}"

echo -e "\nDeploy ${APP_NAME} done."
