import { useEffect, useState } from 'react';
import { apiFetch, Release } from '../lib/api';
import { DownloadSection } from '../components/DownloadSection';
import { MatrixBackground } from '../components/MatrixBackground';

export function DownloadPage() {
  const [releases, setReleases] = useState<Release[]>([]);

  const fetchReleases = () => {
    apiFetch<{ releases: Release[] }>('/api/releases')
      .then((res) => setReleases(res.releases || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#040507] pt-8 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <MatrixBackground className="h-full w-full" />
      </div>
      <div className="relative z-10">
        <DownloadSection releases={releases} onDownloaded={fetchReleases} />
      </div>
    </div>
  );
}
