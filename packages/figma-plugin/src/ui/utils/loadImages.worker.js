const cache = {}

export function preloadImages (urls) {
  for (const url of urls) {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        cache[url] = URL.createObjectURL(blob)
      })
  }
}

export function getImage (url) {
  return cache[url]
}
