import 'cross-fetch/polyfill'

export default async function restRequest(url, options = {}) {
  const { headers, body, ...others } = options

  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
    ...(body && { body: JSON.stringify(body) }),
    ...others,
  })

  // if (response.status === 401) {
  //   // logout()
  //   window.location.assign(window.location);
  //   return;
  // }

  const result = await response.json()

  return response.ok ? result : Promise.reject(result)
}
