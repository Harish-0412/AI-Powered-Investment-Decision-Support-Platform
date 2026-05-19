"use client";

import { X, Clock, ExternalLink, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NewsArticle = {
  source: { name: string };
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content?: string | null;
  author?: string | null;
};

interface NewsModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export function NewsModal({ article, onClose }: NewsModalProps) {
  if (!article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4aa87a] uppercase tracking-wider">
              <span>{article.source.name}</span>
              {article.author && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#8a9a92]" />
                  <span>{article.author}</span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f7f7f2] rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-[#101412]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#101412] leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-[#52625a]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleString(undefined, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </div>
            </div>

            {article.urlToImage && (
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4">
              <p className="text-lg text-[#101412] font-medium leading-relaxed">
                {article.description}
              </p>
              
              <div className="text-[#52625a] leading-relaxed whitespace-pre-wrap">
                {article.content?.split("[+")[0] || "Full content preview not available. Please visit the source for the complete article."}
                {article.content?.includes("[+") && (
                  <span className="italic text-[#8a9a92]">
                    {" "}(Content truncated)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#f0f0f0] bg-[#f7f7f2] flex items-center justify-between">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white rounded-lg transition-colors text-[#52625a]">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button flex items-center gap-2 text-sm !py-2 !px-4"
            >
              Read full article at {article.source.name}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
