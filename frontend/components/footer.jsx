import { Github, Youtube } from "lucide-react";
import { Icon } from '@iconify/react';
import xLogo from '@iconify-icons/simple-icons/x';

export function Footer() {
  return (
    <>
      {/* Footer Gradient */}
      <div className="h-6 bg-gradient-to-b from-[#1a1a1a] to-[#121212]" />
      <footer className="py-8 bg-[#121212]" role="contentinfo" aria-label="Site footer">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 items-center justify-center">
            <a
              className="text-gray-400 hover:text-white transition-colors"
              href="https://github.com/TheRobertFenney"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Robert Fenney's GitHub profile"
              title="GitHub Profile"
            >
              <Github size={20} aria-hidden="true" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              className="text-gray-400 hover:text-white transition-colors"
              href="https://x.com/robert_fenney"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Robert Fenney on X (formerly Twitter)"
              title="X (Twitter) Profile"
            >
              <Icon icon={xLogo} width="20" height="20" aria-hidden="true" />
              <span className="sr-only">X (Twitter)</span>
            </a>
            <a
              className="text-gray-400 hover:text-white transition-colors"
              href="https://www.youtube.com/@robert_fenney"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Robert Fenney's YouTube channel"
              title="YouTube Channel"
            >
              <Youtube size={20} aria-hidden="true" />
              <span className="sr-only">YouTube</span>
            </a>
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>
              <span itemScope itemType="http://schema.org/Person">
                <meta itemProp="name" content="Robert Fenney" />
                <meta itemProp="url" content="https://github.com/TheRobertFenney" />
                Built by Robert Fenney
              </span>
              {" • "}
              <a 
                href="https://github.com/TheRobertFenney/pixelchart/blob/main/LICENSE"
                className="hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT License
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
