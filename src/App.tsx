import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Franchise {
  sport: string;
  name: string;
  slug: string;
  is_default: boolean;
  seasons: Record<string, string>;
  latest_season: number;
}

function App() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/franchises`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFranchises(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <h1>Fantasy Analytics</h1>
      <p className="subtitle">Yahoo Fantasy league data + analytics</p>

      {loading && <p>Loading...</p>}
      {error && <p className="error">API error: {error}</p>}

      <div className="franchises">
        {franchises.map((f) => (
          <div key={f.slug} className="card">
            <div className="card-header">
              <span className="sport-badge">{f.sport.toUpperCase()}</span>
              <h2>{f.name}</h2>
            </div>
            <div className="card-body">
              <p>
                <strong>Seasons:</strong>{" "}
                {Object.keys(f.seasons).sort().reverse().join(", ")}
              </p>
              <p>
                <strong>Latest:</strong> {f.latest_season}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && franchises.length === 0 && (
        <p>No franchises configured. Check the API server.</p>
      )}
    </div>
  );
}

export default App;
