// app/components/SpotifyPodcast.tsx
type Props = {
    showId: string;
    type?: "show" | "episode";
    compact?: boolean;
};

export default function SpotifyPodcast({ showId, type = "episode", compact = false}: Props) {
    return (
        <iframe
            src={`https://open.spotify.com/embed/${type}/${showId}`}
            title="Spotify-podcast"
            width="100%"
            height={compact ? 152 : 232}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border-0"
        />
    );
}