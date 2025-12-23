// import CryptoJS from "crypto-js";

// function encryptAES(data: any, secretKey: string, iv: string) {
//   const jsonData = JSON.stringify(data);

//   return CryptoJS.AES.encrypt(jsonData, CryptoJS.enc.Utf8.parse(secretKey), {
//     iv: CryptoJS.enc.Utf8.parse(iv),
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7
//   }).toString();
// }

// export { encryptAES };

import * as CryptoJS from "crypto-js";

export function encryptAES(
  data: unknown,
  secretKey: string,
  iv: string
): string {
  const jsonData = JSON.stringify(data);

  return CryptoJS.AES.encrypt(jsonData, CryptoJS.enc.Utf8.parse(secretKey), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}