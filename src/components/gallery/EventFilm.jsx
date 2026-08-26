import { RefreshCw } from "lucide-react";
import { useRef, useState } from "react";

export default function EventFilm({ video, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const player = useRef(null);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try { await onRefresh?.(); setStale(false); player.current?.load(); }
    finally { setRefreshing(false); }
  }

  return <section className="gallery-event-film" aria-labelledby="event-film-title">
    <header><p className="eyebrow">The event film</p><h2 id="event-film-title">Relive the Moment</h2></header>
    <div className="gallery-event-film-frame">
      <video
        ref={player}
        controls
        playsInline
        preload="metadata"
        poster={video.posterUrl || "/dfb-film-poster.svg"}
        src={video.url}
        onError={() => setStale(true)}
      >Your browser does not support private MP4 playback.</video>
    </div>
    {stale && <div className="gallery-film-refresh" role="alert"><span>This private film link needs to be refreshed.</span><button onClick={refresh} disabled={refreshing}><RefreshCw />{refreshing ? "Refreshing…" : "Refresh Film"}</button></div>}
  </section>;
}
