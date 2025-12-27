'use client';

import { VideoPlayer } from '@/features/video-player';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center font-bold text-xl">
            V
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            VIB3
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Discover</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Live</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Creators</a>
          <a href="#" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-full font-medium transition-colors">
            Sign In
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Your Ultimate{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Social Video
              </span>{' '}
              Experience
            </h1>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              Create amazing short videos, connect with creators, go live, and discover trending content.
              VIB3 is where creativity meets community.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full font-semibold text-lg transition-all transform hover:scale-105">
                Start Exploring
              </button>
              <button className="px-8 py-4 border border-slate-600 hover:border-cyan-500 rounded-full font-semibold text-lg transition-colors">
                Download App
              </button>
            </div>
          </div>

          {/* Right: Video Player Demo */}
          <div className="aspect-[9/16] max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20">
            <VideoPlayer
              src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
              autoPlay={true}
              muted={true}
              loop={true}
              showControls={true}
              aspectRatio={9/16}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Features */}
        <section className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-2xl">
              🎬
            </div>
            <h3 className="text-xl font-semibold mb-3">Create Videos</h3>
            <p className="text-slate-400">
              Powerful editing tools, AR filters, music library, and effects to make your content stand out.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-2xl">
              📡
            </div>
            <h3 className="text-xl font-semibold mb-3">Go Live</h3>
            <p className="text-slate-400">
              Stream to your followers in real-time. Receive gifts, interact with comments, and grow your audience.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-2xl">
              💰
            </div>
            <h3 className="text-xl font-semibold mb-3">Creator Fund</h3>
            <p className="text-slate-400">
              Monetize your content through tips, subscriptions, and the VIB3 Creator Fund.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-24 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">© 2025 Docs Marketplace LLC. All rights reserved.</p>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="https://vib3app.net/privacy.html" className="hover:text-cyan-400">Privacy</a>
            <a href="https://vib3app.net/terms.html" className="hover:text-cyan-400">Terms</a>
            <a href="https://vib3app.net/community-guidelines.html" className="hover:text-cyan-400">Guidelines</a>
            <a href="https://vib3app.net/contact.html" className="hover:text-cyan-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
