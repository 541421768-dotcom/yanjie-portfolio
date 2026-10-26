import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
const rl=createInterface({input:process.stdin,output:process.stdout});
try {
  const password=await rl.question('设置后台密码（至少16位）: ');
  if(password.length<16)throw Error('密码太短');
  const salt=randomBytes(24),hash=scryptSync(password,salt,64);
  console.log('ADMIN_PASSWORD_SCRYPT=scrypt$'+salt.toString('base64url')+'$'+hash.toString('base64url'));
} finally {rl.close();}
