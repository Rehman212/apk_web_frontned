import { iconSvg } from "@/lib/art";
import type { StoreApp } from "@/lib/catalog";
import { zipStore } from "@/lib/zip";

export function buildApk(app: StoreApp, version: string) {
  const encoder = new TextEncoder();
  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest package="${app.packageName}" android:versionName="${version}" android:versionCode="1">
  <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34"/>
  <application android:label="${app.name}" android:icon="@drawable/icon">
    <activity android:name=".MainActivity" android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
      </intent-filter>
    </activity>
  </application>
</manifest>
`;
  const mf = `Manifest-Version: 1.0
Created-By: APKNest
Name: ${app.packageName}
Version: ${version}
`;
  const info = JSON.stringify(
    {
      name: app.name,
      package: app.packageName,
      version,
      note: "Unsigned catalog APK (ZIP). Not a Play Store binary.",
    },
    null,
    2,
  );

  return zipStore([
    { name: "AndroidManifest.xml", data: encoder.encode(manifest) },
    { name: "META-INF/MANIFEST.MF", data: encoder.encode(mf) },
    { name: "assets/listing.json", data: encoder.encode(info) },
    { name: "res/drawable/icon.svg", data: encoder.encode(iconSvg(app)) },
  ]);
}
