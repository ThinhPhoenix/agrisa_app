#!/bin/bash
set -e

APP_NAME="agrisa_dev"

rm -rf ios/build build *.ipa

bun i
bunx expo prebuild --platform ios

cd ios
pod install --repo-update

xcodebuild \
  -workspace "${APP_NAME}.xcworkspace" \
  -scheme "${APP_NAME}" \
  -configuration Release \
  -sdk iphoneos \
  -archivePath "./build/${APP_NAME}.xcarchive" \
  archive \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

cd ..

mkdir -p Payload
cp -R "ios/build/${APP_NAME}.xcarchive/Products/Applications/${APP_NAME}.app" Payload/
zip -r "${APP_NAME}.ipa" Payload
rm -rf Payload ios/build

ls -lh "${APP_NAME}.ipa"