export const googleConfig = {
  apiKey: '',
};

export async function googleTranslate(text) {
  const payloadV2 = {
    q: [text],
    source: 'en',
    target: 'zh-TW',
  };

  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleConfig.apiKey}`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(payloadV2), // body data type must match "Content-Type" header
  });
  return res.json(); // parses JSON response into native JavaScript objects
}
