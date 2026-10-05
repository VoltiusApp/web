// The fleet every importer brings in: [name, folder, distro]. All resolve on promo-social-net, deploy/deploy on 22.
export const FLEET = [
  ['web-01', 'Production', 'debian'], ['web-02', 'Production', 'debian'], ['web-03', 'Production', 'debian'], ['web-04', 'Production', 'debian'],
  ['api-01', 'Production', 'debian'], ['api-02', 'Production', 'debian'], ['api-03', 'Production', 'debian'],
  ['db-01', 'Databases', 'debian'], ['db-02', 'Databases', 'debian'], ['cache-01', 'Databases', 'debian'],
  ['worker-01', 'Workers', 'debian'], ['worker-02', 'Workers', 'debian'],
];
export const FOLDERS = [...new Set(FLEET.map(([, f]) => f))];
