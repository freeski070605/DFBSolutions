export const links = {
  email: "",
  instagram: "",
  youtube: "https://youtu.be/hu2nJCrIzno?si=tytmkSBqa44IgSWj",
  tiktok: "",
  spotify: "",
  appleMusic: "",
  youtubeMusic: "",
  tidal: "",
  audiomack: "",
  soundcloud: "",
  cashApp: "",
  paypal: "",
  buyMeACoffee: "",
  bandcamp: "",
};

export function hasLink(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getStreamingLinks() {
  return [
    ["Spotify", links.spotify],
    ["Apple Music", links.appleMusic],
    ["YouTube Music", links.youtubeMusic],
    ["Tidal", links.tidal],
    ["Audiomack", links.audiomack],
    ["SoundCloud", links.soundcloud],
  ].filter(([, url]) => hasLink(url));
}

export function getSupportLinks() {
  return [
    ["Cash App", links.cashApp],
    ["PayPal", links.paypal],
    ["Buy Me A Coffee", links.buyMeACoffee],
    ["Bandcamp", links.bandcamp],
  ].filter(([, url]) => hasLink(url));
}
