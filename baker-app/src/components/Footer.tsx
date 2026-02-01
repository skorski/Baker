export default function Footer() {
  return (
    <footer className="mt-16 py-6 border-t border-stone-200">
      <div className="container mx-auto px-6 max-w-5xl">
        <p className="text-xs text-stone-400 text-center">
          Built {__BUILD_DATE__} · {__GIT_COMMIT__}
        </p>
      </div>
    </footer>
  );
}
