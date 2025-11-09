#!/bin/bash
set -e

PROJECT_NAME="Agrisa"
APP_NAME="agrisa_dev_$(date +%Y%m%d_%H%M%S)"

rm -rf ios/build build *.ipa

bun i
bunx expo prebuild --platform ios

cd ios
pod install --repo-update

xcodebuild \
  -workspace "${PROJECT_NAME}.xcworkspace" \
  -scheme "${PROJECT_NAME}" \
  -configuration Release \
  -sdk iphoneos \
  -archivePath "./build/${PROJECT_NAME}.xcarchive" \
  archive \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

cd ..

mkdir -p Payload
cp -R "ios/build/${PROJECT_NAME}.xcarchive/Products/Applications/${PROJECT_NAME}.app" Payload/
zip -r "${APP_NAME}.ipa" Payload
rm -rf Payload ios/build

ls -lh "${APP_NAME}.ipa"