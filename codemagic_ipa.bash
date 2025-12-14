#!/bin/bash

if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

curl -X POST "https://api.codemagic.io/builds" \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $CODEMAGIC_API_TOKEN" \
  --data '{
    "appId": "'$CODEMAGIC_APP_ID'",
    "workflowId": "ipa",
    "branch": "master"
  }'
