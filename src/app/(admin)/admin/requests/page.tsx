"use client";

import { getAllArtistRequests, updateArtistRequestStatus } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Clock, XCircle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { dict } = useLanguage();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await getAllArtistRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateArtistRequestStatus(id, status);
    loadRequests();
  };

  if (loading) return <div className="p-10 text-center text-textMuted">{dict.common.loading}</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto animate-entry">
      <h1 className="text-3xl font-bold mb-8 text-textMain">{dict.common.artistCardRequests}</h1>

      <div className="glass rounded-3xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-textMuted">{dict.common.noRequests}</div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="p-6 hover:bg-surfaceHover transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-textMain">{req.type}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        req.status === 'DONE' ? 'bg-success/20 text-success' :
                        req.status === 'REJECTED' ? 'bg-error/20 text-error' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-sm text-textMuted flex items-center gap-2">
                      <span>{req.user.name} ({req.user.email})</span>
                      {req.user.tariff === 'PREMIUM' && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/20">PREMIUM</span>
                      )}
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-success text-white hover:bg-success/80"
                        onClick={() => handleStatusUpdate(req.id, 'DONE')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {dict.common.complete}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-error text-white hover:bg-error/80"
                        onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {dict.common.reject}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border mb-4 text-sm text-textMain whitespace-pre-wrap">
                  {req.description}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {req.platform && (
                    <div className="px-3 py-1 bg-surfaceHover rounded-lg border border-border text-textMuted">
                      {dict.common.platform}: <span className="text-textMain font-medium">{req.platform}</span>
                    </div>
                  )}
                  {req.artistCardLink && (
                    <a href={req.artistCardLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" /> {dict.common.artistCard}
                    </a>
                  )}
                  {req.attachmentUrl && (
                    <a href={req.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" /> {dict.common.attachment}
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}