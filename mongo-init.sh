#!/bin/bash
set -e

mongo <<EOF
use $MONGO_DATABASE_NAME
db.createUser({
  user:  '$MONGO_USER_NAME',
  pwd: '$MONGO_USER_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_DATABASE_NAME'
  }]
})
EOF