import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGitHubRepositories,
  getGitHubStatus,
  selectGitHubRepository,
  syncGitHubRepository,
  type GitHubRepository,
  type GitHubStatus,
} from "../services/api";

export default function RepositorySetup() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSetup() {
      try {
        const userStatus = await getGitHubStatus();
        const repos = await getGitHubRepositories();
        setStatus(userStatus);
        setRepositories(repos);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load repositories");
      } finally {
        setLoading(false);
      }
    }

    loadSetup();
  }, []);

  async function handleSelect(repository: GitHubRepository) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await selectGitHubRepository(repository);
      if (status) {
        setStatus({
          ...status,
          repository: { owner: repository.owner, name: repository.name },
        });
      }
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "Failed to select repository");
    } finally {
      setSaving(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError("");
    setMessage("");
    try {
      const result = await syncGitHubRepository();
      setMessage(
        `${result.sync.solutionFilesProcessed} solution files were processed from ${result.sync.commitsChecked} recent commits.`,
      );
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Failed to sync repository");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) return <p className="p-8 text-sm text-[#6B6659]">Loading repositories…</p>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-8 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578]">Setup</p>
        <h1 className="mt-3 font-serif text-4xl text-[#1C1B19]">Choose your solutions repository</h1>
        <p className="mt-3 text-sm text-[#6B6659]">
          Signed in as {status?.githubUsername}. Select the repository that contains your LeetCode solutions, then sync it.
        </p>

        <div className="mt-6 rounded-xl border border-[#E8E4DA] bg-white p-5">
          <h2 className="font-medium text-[#1C1B19]">How setup works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#6B6659]">
            <li>
              Install and connect <a className="text-[#2B3A55] underline" href="https://github.com/arunbhardwaj/LeetHub-2.0" target="_blank" rel="noreferrer">LeetHub v2</a> to GitHub.
            </li>
            <li>Choose the repository where LeetHub saves your accepted LeetCode solutions.</li>
            <li>Sync below. The first sync checks only the previous 24 hours; later syncs check only commits made since your last successful sync.</li>
          </ol>
        </div>

        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-[#A8553F]">{error}</p>}
        {message && <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-[#35603F]">{message}</p>}

        <div className="mt-8 space-y-3">
          {repositories.map((repository) => {
            const selected = status?.repository?.owner === repository.owner && status.repository.name === repository.name;
            return (
              <button
                key={repository.id}
                type="button"
                disabled={saving}
                onClick={() => handleSelect(repository)}
                className={`w-full rounded-xl border p-5 text-left transition-colors ${
                  selected ? "border-[#2B3A55] bg-[#F3F1EB]" : "border-[#E8E4DA] bg-white hover:border-[#2B3A55]"
                } disabled:opacity-60`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[#1C1B19]">{repository.fullName}</span>
                  {selected && <span className="text-xs font-medium text-[#2B3A55]">Selected</span>}
                </div>
                {repository.description && <p className="mt-1 text-sm text-[#6B6659]">{repository.description}</p>}
              </button>
            );
          })}
        </div>

        {repositories.length === 0 && <p className="mt-8 text-sm text-[#6B6659]">No accessible repositories found.</p>}

        {status?.repository && (
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || saving}
            className="mt-8 rounded-lg bg-[#2B3A55] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1C1B19] disabled:opacity-60"
          >
            {syncing ? "Syncing GitHub repository…" : `Sync ${status.repository.owner}/${status.repository.name}`}
          </button>
        )}

        {message && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="ml-3 rounded-lg border border-[#2B3A55] px-5 py-3 text-sm font-medium text-[#2B3A55] hover:bg-[#F3F1EB]"
          >
            Open dashboard
          </button>
        )}
      </div>
    </div>
  );
}
