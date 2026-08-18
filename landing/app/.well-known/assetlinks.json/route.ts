// Android verifies an App Link by fetching this file over https and matching the
// signing certificate of the installed app against the fingerprints below.
//
// Only the RELEASE certificate belongs here. The debug keystore lives in the
// client repository with a published password, so listing its fingerprint would
// let anyone sign an app that claims voltius.app.
const RELEASE_CERT_SHA256 =
  "FB:08:A9:35:EA:0C:EA:E2:F1:7D:3E:F7:9A:2F:7E:8A:C6:8A:EE:DF:64:81:C3:30:EE:26:13:C2:45:77:FD:65";

export const dynamic = "force-static";

export function GET() {
  return Response.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.voltius.app",
        sha256_cert_fingerprints: [RELEASE_CERT_SHA256],
      },
    },
  ]);
}
