// In-page replacements for the two importers that read app data this Linux box can't have (Termius' LevelDB, MobaXterm's
// Windows registry). Only the native read is replaced: the real parser and the whole import UI run unchanged.
import { FLEET, FOLDERS } from './fleet.mjs';

export const termiusStub = ({ folders = true } = {}) => `
  const { IMPORTERS } = await import('/src/services/import-export/importers.ts');
  const { bundleFromTermius } = await import('/src/services/import-export/parsers/termius.ts');
  const FLEET = ${JSON.stringify(FLEET)}, FOLDERS = ${JSON.stringify(FOLDERS)};
  const R = [];
  const withFolders = ${folders};
  if (withFolders) FOLDERS.forEach((g, i) => R.push({ db_name: 'groups', termius_id: i + 1, decrypted: { label: g } }));
  R.push({ db_name: 'ssh_identities', termius_id: 100, decrypted: { label: 'deploy', username: 'deploy', password: 'deploy', is_visible: true } });
  FLEET.forEach(([name, folder, os], i) => {
    const sc = 1000 + i;
    R.push({ db_name: 'hosts', termius_id: 10 + i, foreign_keys: withFolders ? { ssh_config: sc, group: FOLDERS.indexOf(folder) + 1 } : { ssh_config: sc }, decrypted: { label: name, address: name, os_name: os } });
    R.push({ db_name: 'ssh_configs', termius_id: sc, decrypted: { port: 22 } });
    R.push({ db_name: 'ssh_config_identities', termius_id: 5000 + i, foreign_keys: { ssh_config: sc, identity: 100 }, decrypted: {} });
  });
  R.push({ db_name: 'snippets', termius_id: 900, decrypted: { label: 'Disk usage', script: 'df -h' } });
  R.push({ db_name: 'snippets', termius_id: 901, decrypted: { label: 'Tail syslog', script: 'sudo tail -f /var/log/syslog' } });
  IMPORTERS.find((i) => i.key === 'termius').autoExtract = async () => { await new Promise((r) => setTimeout(r, 700)); return bundleFromTermius(JSON.stringify({ version: 2, records: R })); };
  return 'termius stubbed';
`;

const mobaIni = ['[Bookmarks]', 'SubRep=', 'ImgNum=42'];
FOLDERS.forEach((f, i) => {
  mobaIni.push(`[Bookmarks_${i + 1}]`, `SubRep=${f}`, 'ImgNum=41');
  for (const [name, folder] of FLEET) if (folder === f) mobaIni.push(`${name}=#109#0%${name}%22%deploy%%-1%-1%%%22%%0%0%0%%%-1%0%0%0%%1080%%0%0%1#MobaFont%10%0%0%-1%15%236,236,236%30,30,30%180,180,192%0%-1%0%%xterm%-1%-1%_Std_Colors_0_%80%24%0%1%-1%<none>%%0%0%-1#0# #-1`);
});

export const mobaxtermStub = `
  const { IMPORTERS } = await import('/src/services/import-export/importers.ts');
  const { connectionsFromMobaXterm } = await import('/src/services/import-export/parsers/mobaxterm.ts');
  const { importedBundle } = await import('/src/services/import-export/formats.ts');
  const INI = ${JSON.stringify(mobaIni.join('\r\n'))};
  IMPORTERS.find((i) => i.key === 'mobaxterm').autoExtract = async () => { await new Promise((r) => setTimeout(r, 700)); return importedBundle({ connections: connectionsFromMobaXterm(INI) }); };
  return 'mobaxterm stubbed';
`;

export const CSV = ['name,host,port,username,tags', ...FLEET.map(([name, folder]) => `${name},${name},22,deploy,${folder.toLowerCase()}`)].join('\n') + '\n';
