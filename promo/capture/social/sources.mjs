// Writes each importer's source data where the real app looks for it on Linux (run on the host, copies into promo-social).
import { execFileSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { FLEET, FOLDERS } from './fleet.mjs';

const root = mkdtempSync(join(tmpdir(), 'promo-src-'));
const put = (rel, text) => { mkdirSync(join(root, rel, '..'), { recursive: true }); writeFileSync(join(root, rel), text); };

// PuTTY (unix storage): one file per session, name percent-encoded.
for (const [name] of FLEET) put(`.putty/sessions/${name}`, ['Present=1', `HostName=${name}`, 'Protocol=ssh', 'PortNumber=22', 'UserName=deploy', 'PublicKeyFile=', 'ProxyMethod=0'].join('\n') + '\n');

// SecureCRT: Config/Sessions/<folder>/<session>.ini, UTF-8 with BOM.
for (const [name, folder] of FLEET) {
  put(`.vandyke/SecureCRT/Config/Sessions/${folder}/${name}.ini`, '﻿' + [`S:"Hostname"=${name}`, 'S:"Protocol Name"=SSH2', 'D:"[SSH2] Port"=00000016', 'S:"Username"=deploy', 'D:"Session Password Saved"=00000000'].join('\n') + '\n');
}
put('.vandyke/SecureCRT/Config/Global.ini', '﻿D:"Config Version"=00000004\n');

// ZOC 9: Documents/ZOC9 Files/Options/HostDirectory.zhd, folders in [STRUCTURE].
const zhd = ['ZOC9.00.0 // HOST DIRECTORY DEFAULT', '[STRUCTURE]', 'NumSections=1', 'Section#0=My Connections', ...FOLDERS.map((f, i) => `Folder#${i + 1}=0.0|${f}`), '[/STRUCTURE]', '[DATA]'];
FLEET.forEach(([name, folder], i) => zhd.push('[HOST]', 'section=0', `folder=${FOLDERS.indexOf(folder) + 1}`, `handle=${i + 1}`, `name="${name}"`, `connectto="${name}:22"`, 'deviceid=9', 'username="deploy"', '[/HOST]'));
zhd.push('[/DATA]');
put('Documents/ZOC9 Files/Options/HostDirectory.zhd', zhd.join('\r\n') + '\r\n');
put('.config/user-dirs.dirs', 'XDG_DOCUMENTS_DIR="$HOME/Documents"\n');

execFileSync('docker', ['cp', `${root}/.`, 'promo-social:/home/builder/']);
execFileSync('docker', ['exec', '-u', 'root', '-w', '/', 'promo-social', 'chown', '-R', 'builder:builder', '/home/builder/.putty', '/home/builder/.vandyke', '/home/builder/Documents', '/home/builder/.config']);
console.log('sources in place');
