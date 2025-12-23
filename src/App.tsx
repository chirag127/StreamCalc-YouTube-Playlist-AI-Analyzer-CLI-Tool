import { useState } from 'react';

function App() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [totalLength, setTotalLength] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePlaylistLength = async () => {
    if (!playlistUrl) {
      setError('Please enter a YouTube playlist URL.');
      return;
    }

    // Basic regex to extract playlist ID
    const playlistIdMatch = playlistUrl.match(/[&?]list=([a-zA-Z0-9_-]+)/);
    if (!playlistIdMatch) {
      setError('Invalid YouTube playlist URL. Make sure it contains a "list" parameter.');
      setTotalLength(null);
      return;
    }
    const playlistId = playlistIdMatch[1];

    setIsLoading(true);
    setError(null);
    setTotalLength(null);

    try {
      // Using a public Invidious instance API
      const response = await fetch(`https://invidious.nerdvpn.de/api/v1/playlists/${playlistId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      if (!data.videos || data.videos.length === 0) {
        setError('Could not find any videos in the playlist, or the playlist is private.');
        return;
      }

      const totalSeconds = data.videos.reduce((acc: number, video: { lengthSeconds: number }) => acc + video.lengthSeconds, 0);

      // Format seconds into HH:MM:SS
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formattedLength = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');

      setTotalLength(formattedLength);
    } catch (err) {
      setError(err instanceof Error ? `Failed to fetch playlist data: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans text-white p-4">
      <div className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-400">StreamCalc</h1>
          <p className="text-gray-400 mt-2">YouTube Playlist Length Analyzer</p>
        </div>

        <div className="space-y-4">
          <label htmlFor="playlist-url" className="block text-sm font-medium text-gray-300">
            YouTube Playlist URL
          </label>
          <input
            id="playlist-url"
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          />
        </div>

        {/* As per AGENTS.md, UI for user-provided API key */}
        <div className="space-y-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">
            API Key (Optional)
          </label>
          <input
            id="api-key"
            type="password"
            placeholder="Enter your API key (not required for this service)"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          />
        </div>

        <button
          onClick={calculatePlaylistLength}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500"
        >
          {isLoading ? 'Calculating...' : 'Calculate Total Length'}
        </button>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md text-center">
            <p>{error}</p>
          </div>
        )}

        {totalLength && (
          <div className="bg-gray-700 text-center p-6 rounded-lg">
            <p className="text-gray-400 text-lg">Total Playlist Duration:</p>
            <p className="text-5xl font-extrabold text-cyan-300 tracking-wider">{totalLength}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;