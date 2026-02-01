import { GithubLogo } from '@phosphor-icons/react';

export default function Footer() {
  return (
    <footer className="mt-16 py-6 border-t border-stone-200">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-center justify-center gap-4">
          <p className="text-xs text-stone-400">
            Built {__BUILD_DATE__} · {__GIT_COMMIT__}
          </p>
          <a
            href="https://github.com/skorski/Baker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="View source on GitHub"
          >
            <GithubLogo size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
