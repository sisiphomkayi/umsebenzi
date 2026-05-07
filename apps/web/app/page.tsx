import Link from 'next/link'
import {
  Briefcase, GraduationCap, FileText, Mic,
  Shield, Star, Users, TrendingUp, ArrowRight,
  CheckCircle, MapPin, Truck
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center font-bold text-sm">U</div>
          <span className="text-xl font-bold">Umsebenzi</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/jobs" className="hover:text-[#F97316] transition-colors">Find Work</Link>
          <Link href="/hire" className="hover:text-[#F97316] transition-colors">Hire Workers</Link>
          <Link href="/education" className="hover:text-[#F97316] transition-colors">Education</Link>
          <Link href="/about" className="hover:text-[#F97316] transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm hover:text-[#F97316] transition-colors">Login</Link>
          <Link href="/register" className="bg-[#F97316] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#FB923C] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2B5299] to-[#1B3A6B] text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <span className="w-2 h-2 bg-[#F97316] rounded-full animate-pulse"></span>
            Africa's #1 Verified Work Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Work. Verified.
            <span className="text-[#F97316]"> Connected.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find verified workers, get hired, build skills, and grow your career.
            Umsebenzi connects Africa's workforce with opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=JOB_SEEKER"
              className="bg-[#F97316] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#FB923C] transition-all flex items-center gap-2 justify-center">
              Find Work <ArrowRight size={20} />
            </Link>
            <Link href="/register?role=CLIENT"
              className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all flex items-center gap-2 justify-center">
              Hire Workers <Users size={20} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            {[
              { value: '100%', label: 'Verified Workers' },
              { value: 'Free', label: 'To Get Started' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#F97316]">{stat.value}</div>
                <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#1B3A6B] mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Get started in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register & Verify', desc: 'Create your profile, upload your documents and complete your fingerprint verification at PostNet.', icon: Shield },
              { step: '02', title: 'Connect & Match', desc: 'Browse jobs or post a request. Our smart matching connects the right people for every job.', icon: Users },
              { step: '03', title: 'Work & Get Paid', desc: 'Sign a contract, complete the work, and get paid securely through our escrow system.', icon: CheckCircle },
            ].map((item) => (
              <div key={item.step} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-card-hover transition-all">
                <div className="text-5xl font-bold text-[#F97316]/20 mb-4">{item.step}</div>
                <div className="w-14 h-14 bg-[#1B3A6B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon size={28} className="text-[#1B3A6B]" />
                </div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#1B3A6B] mb-4">Everything You Need</h2>
            <p className="text-gray-500 text-lg">One platform for your entire work journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: 'Job Notice Board', desc: 'Browse hundreds of verified job opportunities posted daily.', color: 'bg-blue-50 text-blue-600' },
              { icon: GraduationCap, title: 'Education', desc: 'Access courses from Udemy, Coursera and more. Attach certificates to your profile.', color: 'bg-green-50 text-green-600' },
              { icon: FileText, title: 'CV Revamp', desc: 'AI-powered CV optimization. Know your match score before applying.', color: 'bg-orange-50 text-orange-600' },
              { icon: Mic, title: 'Interview Mock', desc: 'Practice with AI interviewers. Get scored and receive detailed feedback.', color: 'bg-purple-50 text-purple-600' },
              { icon: Truck, title: 'Transport', desc: 'Need to get to a job? We arrange transport so you never miss an opportunity.', color: 'bg-yellow-50 text-yellow-600' },
              { icon: Shield, title: 'Verified & Safe', desc: 'All workers are fingerprint verified with background checks for your safety.', color: 'bg-red-50 text-red-600' },
            ].map((feature) => (
              <div key={feature.title} className="card hover:shadow-card-hover transition-all cursor-pointer group">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#1B3A6B] mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#1B3A6B] mb-4">Built For Everyone</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Job Seekers',
                price: 'Free',
                color: 'border-[#1B3A6B]',
                badge: 'bg-[#1B3A6B]',
                features: ['Create verified profile', 'Browse all job listings', 'AI CV Revamp', 'Interview Mock practice', 'Get hired & paid securely'],
              },
              {
                title: 'Clients',
                price: '$10 once-off',
                color: 'border-[#F97316]',
                badge: 'bg-[#F97316]',
                features: ['Browse verified workers', 'Post job requests', 'Chat & sign contracts', 'Secure escrow payments', 'Rate & review workers'],
              },
              {
                title: 'Companies',
                price: '$20/month',
                color: 'border-[#10B981]',
                badge: 'bg-[#10B981]',
                features: ['Company profile & branding', 'Post unlimited jobs', 'Access candidate database', 'Bulk hiring tools', 'Analytics dashboard'],
              },
            ].map((plan) => (
              <div key={plan.title} className={`card border-2 ${plan.color} hover:shadow-card-hover transition-all`}>
                <div className={`inline-block ${plan.badge} text-white text-xs px-3 py-1 rounded-full mb-4`}>{plan.title}</div>
                <div className="text-3xl font-bold text-[#1B3A6B] mb-6">{plan.price}</div>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-[#10B981] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/register?role=${plan.title.toUpperCase().replace(' ', '_')}`}
                  className="btn-primary w-full mt-6 text-center block text-sm">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#1B3A6B] to-[#2B5299] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-200 text-lg mb-8">Join thousands of verified workers and clients on Umsebenzi today.</p>
          <Link href="/register"
            className="bg-[#F97316] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#FB923C] transition-all inline-flex items-center gap-2">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F2040] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center font-bold text-sm">U</div>
                <span className="text-xl font-bold">Umsebenzi</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Africa's verified work ecosystem. Connecting workers and opportunities across the continent.</p>
            </div>
            {[
              { title: 'Platform', links: ['Find Work', 'Hire Workers', 'Job Board', 'Education'] },
              { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms'] },
              { title: 'Support', links: ['Help Centre', 'FAQ', 'Report Issue', 'Contact Us'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-gray-400 text-sm hover:text-[#F97316] transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            © 2026 Umsebenzi. All rights reserved. Built with ❤️ for Africa.
          </div>
        </div>
      </footer>

    </main>
  )
}
