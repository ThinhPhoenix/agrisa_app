#!/bin/bash
set -e

APP_NAME="Agrisa"
BUNDLE_ID="com.tnhaan.agrisa"
ARCHIVE_PATH="ios/build/${APP_NAME}.xcarchive"
EXPORT_PATH="ios/build/ipa"
EXPORT_PLIST="ios/exportOptions.plist"

rm -rf ios/build
rm -rf build

bun install || npm install

bunx expo prebuild --platform ios

cd ios
pod install --repo-update
cd ..

cd ios
xcodebuild \
  -workspace "${APP_NAME}.xcworkspace" \
  -scheme "${APP_NAME}" \
  -configuration Release \
  -sdk iphoneos \
  -archivePath "./build/${APP_NAME}.xcarchive" \
  archive CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
cd ..

cat > "$EXPORT_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>ad-hoc</string>
  <key>signingStyle</key><string>manual</string>
  <key>compileBitcode</key><false/>
  <key>signingCertificate</key><string></string>
  <key>signingIdentity</key><string></string>
  <key>teamID</key><string></string>
  <key>stripSwiftSymbols</key><true/>
  <key>destination</key><string>export</string>
  <key>thinning</key><string>&lt;none&gt;</string>
  <key>generateAppStoreInformation</key><false/>
  <key>uploadSymbols</key><false/>
  <key>uploadBitcode</key><false/>
  <key>bundleIdentifier</key><string>${BUNDLE_ID}</string>
</dict>
</plist>
EOF

cd ios
xcodebuild \
  -exportArchive \
  -archivePath "./build/${APP_NAME}.xcarchive" \
  -exportOptionsPlist "../exportOptions.plist" \
  -exportPath "../"
cd ..