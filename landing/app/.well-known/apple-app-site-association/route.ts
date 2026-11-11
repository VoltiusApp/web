// iOS verifies a Universal Link by fetching this file over https and matching
// the app identifier (Team ID + bundle id) of the installed app. The iOS bundle
// id is app.voltius: Apple reported com.voltius.app as taken by another team.
//
// Same paths as the Android App Link (src-tauri/tauri.conf.json, deep-link).
const APP_ID = "PQ94FFKWHV.app.voltius";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return Response.json({
    applinks: {
      details: [
        {
          appIDs: [APP_ID],
          components: [{ "/": "/open" }, { "/": "/open/*" }],
        },
      ],
    },
  });
}
