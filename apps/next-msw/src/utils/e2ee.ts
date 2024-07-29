/*
Convert an ArrayBuffer into a string
from https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
*/
export function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode(...new Uint8Array(buf));
}
// from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
export function str2ab(_str: string) {
  const str = atob(_str);
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function pem(type: 'public' | 'private', data: string) {
  const pemHeader = `-----BEGIN ${type.toUpperCase()} KEY-----`;
  const pemFooter = `-----END ${type.toUpperCase()} KEY-----`;
  const base64 = globalThis.btoa(data);
  return `${pemHeader}${base64}${pemFooter}`;
}
