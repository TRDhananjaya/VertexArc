import { useState } from "react";
import Login from "./pages/Login";

function App() {
  const [session, setSession] = useState(null);

  function handleLogin(data) {
    // Temporary in-memory session for our first integration test
    setSession(data);
  }

  function handleLogout() {
    setSession(null);
  }

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">
          Welcome to VertexArc!
        </h1>

        <p className="mt-3 text-slate-400">
          Your login request was successful.
        </p>

        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
          Authentication successful
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default App;
