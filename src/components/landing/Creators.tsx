/**
 * Creators section
 * Highlights what creators can do on VIB3
 */
'use client';

export function Creators() {
  return (
    <section id="creators" className="py-24 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <span className="text-purple-400 text-sm font-medium">For Creators</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Turn your passion into </span>
              <span className="bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
                income
              </span>
            </h2>

            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              VIB3 isn't just another platform. We're built for creators who want to grow their audience and actually get paid for their work.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Direct Tips & Gifts</h3>
                  <p className="text-white/50 text-sm">Fans can send virtual gifts during lives and on videos. Cash out anytime.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Subscriber Exclusives</h3>
                  <p className="text-white/50 text-sm">Offer exclusive content to your subscribers with tiered pricing you control.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Creator Fund</h3>
                  <p className="text-white/50 text-sm">Get paid based on your video performance. No minimum follower count to start.</p>
                </div>
              </div>
            </div>

            <button className="mt-10 px-8 py-4 bg-gradient-to-r from-purple-500 to-teal-400 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/30">
              Start Earning Today
            </button>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-white/5 to-black/20 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />

              {/* Mock earnings card */}
              <div className="relative bg-[#252B3B] rounded-2xl p-6 mb-6">
                <div className="text-white/50 text-sm mb-2">This Month's Earnings</div>
                <div className="text-4xl font-bold text-white mb-1">$12,847</div>
                <div className="flex items-center gap-2 text-teal-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +23% from last month
                </div>
              </div>

              {/* Mock stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#252B3B] rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">2.4M</div>
                  <div className="text-white/50 text-xs">Video Views</div>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">847K</div>
                  <div className="text-white/50 text-xs">Followers</div>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">12.4K</div>
                  <div className="text-white/50 text-xs">Gifts Received</div>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">3.2K</div>
                  <div className="text-white/50 text-xs">Subscribers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
