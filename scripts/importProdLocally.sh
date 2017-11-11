#!/usr/bin/env bash

export BACKUP_DIR="~/tools/mongodb_backup"

#mongodump -h ${PROD_ADDRESS} -d ${USER} -u ${USER} -p ${PASSWORD} -o ${BACKUP_DIR}

#mongorestore -h localhost:27017 -d test ${BACKUP_DIR}