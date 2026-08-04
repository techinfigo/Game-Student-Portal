/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Search, FileText, ExternalLink, FolderOpen } from 'lucide-react';
import { getAll } from '../services/dataService';
import { FirestoreResource } from '../types';

type ResourceDoc = FirestoreResource & { id: string };

export default function FreeResources() {
  const [resources, setResources] = useState<ResourceDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    getAll<FirestoreResource>('resources').then((data) => {
      if (isMounted) {
        const hasKindField = data.some((r) => r.resourceKind !== undefined);
        setResources(hasKindField ? data.filter((r) => r.resourceKind === 'free') : data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Free Resources</h2>
          <p className="text-slate-500 font-medium">Handy links and downloads to support your prep.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-game-teal transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
          <div className="bg-slate-100 p-6 rounded-full mb-6">
            <FolderOpen size={48} className="opacity-20" />
          </div>
          <p className="font-bold text-slate-900">No resources found</p>
          <p className="text-sm mt-1">Check back soon for new downloads and links.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="card-solid flex flex-col h-full group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden rounded-t-xl bg-slate-100 flex items-center justify-center">
                {resource.image ? (
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                ) : (
                  <FileText size={40} className="text-slate-300" />
                )}
                {resource.category && (
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-slate-600 uppercase tracking-widest border border-slate-100">
                    {resource.category}
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 text-[13px] leading-tight group-hover:text-game-teal transition-colors line-clamp-2 mb-2">{resource.title}</h3>
                {resource.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">{resource.description}</p>
                )}
                <a
                  href={resource.fileOrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full text-center btn-primary !py-1.5 !text-[9px] !uppercase !tracking-widest !font-black !rounded-md flex items-center justify-center gap-1.5"
                >
                  {resource.action || 'View Resource'}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
