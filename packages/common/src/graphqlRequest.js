import 'isomorphic-unfetch'

export function getGraphQLClient (endpoint = '', options = {}) {
  return {
    async request (query, variables) {
      const { headers, ...others } = options

      const body = JSON.stringify({
        query,
        variables,
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body,
        ...others,
      })

      const contentType = response.headers.get('Content-Type')

      const result = await (contentType &&
      contentType.startsWith('application/json')
        ? response.json()
        : response.text())

      if (response.ok && !result.errors && result.data) {
        return result.data
      } else {
        throw new Error(`Status ${response.status}`)
      }
    },

    setHeaders (headers) {
      options.headers = headers
    },

    setHeader (key, value) {
      const { headers } = options

      if (headers) {
        headers[key] = value
      } else {
        options.headers = { [key]: value }
      }
    },
  }
}

export default function graphqlRequest (endpoint, query, variables) {
  return getGraphQLClient(endpoint).request(query, variables)
}
