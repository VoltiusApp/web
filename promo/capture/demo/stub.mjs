export const STUB = `
  const { IMPORTERS } = await import('/src/services/import-export/importers.ts');
  const { bundleFromTermius } = await import('/src/services/import-export/parsers/termius.ts');
  const groups = ['Production', 'Databases', 'Kubernetes', 'Homelab'];
  const flat = new Set([1, 2]);
  const hosts = [
    ['web-01', 'ubuntu', 1], ['web-02', 'ubuntu', 1], ['api-gateway', 'debian', 1], ['cache-01', 'alpine', 1],
    ['db-primary', 'debian', 2], ['db-replica', 'debian', 2], ['analytics', 'ubuntu', 2],
    ['k8s-node-1', 'ubuntu', 3], ['k8s-node-2', 'ubuntu', 3], ['ci-runner', 'alpine', 3],
    ['grafana', 'debian', 4], ['pihole', 'raspbian', 4], ['nas-01', 'debian', 4],
  ];
  hosts.reverse();
  const R = [];
  groups.forEach((g, i) => flat.has(i + 1) || R.push({ db_name: 'groups', termius_id: i + 1, decrypted: { label: g } }));
  R.push({ db_name: 'ssh_identities', termius_id: 100, decrypted: { label: 'deploy', username: 'deploy', password: 'deploy', is_visible: true } });
  hosts.forEach(([name, os, g], i) => {
    const sc = 1000 + i;
    R.push({ db_name: 'hosts', termius_id: 10 + i, foreign_keys: flat.has(g) ? { ssh_config: sc } : { ssh_config: sc, group: g }, decrypted: { label: name, address: name, os_name: os } });
    R.push({ db_name: 'ssh_configs', termius_id: sc, decrypted: { port: 2222 } });
    R.push({ db_name: 'settings', termius_id: sc, decrypted: { port: 2222 } });
    R.push({ db_name: 'ssh_config_identities', termius_id: 5000 + i, foreign_keys: { ssh_config: sc, identity: 100 }, decrypted: {} });
  });
  R.push({ db_name: 'snippets', termius_id: 900, decrypted: { label: 'Tail nginx', script: 'tail -f /var/log/nginx/access.log' } });
  R.push({ db_name: 'snippets', termius_id: 901, decrypted: { label: 'Disk usage', script: 'df -h' } });
  IMPORTERS.find(i => i.key === 'termius').autoExtract = async () => { await new Promise(r => setTimeout(r, 700)); return bundleFromTermius(JSON.stringify({ version: 2, records: R })); };
  return 'stubbed';
`;
