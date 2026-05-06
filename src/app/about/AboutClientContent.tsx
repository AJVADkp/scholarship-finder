'use client'

import { motion, Variants } from 'framer-motion'
import { Search, SlidersHorizontal, Heart } from 'lucide-react'
import { useState } from 'react'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

export function AboutClientContent() {
  return (
    <div className="space-y-16 lg:space-y-32 md:space-y-24">
      {/* 02. HERO SECTION */}
      <section className="text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/60 bg-white/45 backdrop-blur-md text-[12px] font-medium text-[#185FA5]"
        >
          SDG Project · Christ College of Engineering, Irinjalakuda
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="font-extrabold text-[#1a1a2e] leading-[1.2] mb-6"
          style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)' }}
        >
          We built this so no student misses out.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="text-[1.1rem] text-[#4a5568] max-w-[580px] mx-auto leading-relaxed"
        >
          ScholarSearch started as an SDG project — and turned into something we genuinely care about.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="h-[1px] w-[80px] bg-[#4F8EF7]/20 mt-8"
        />
      </section>

      {/* 03. OUR STORY */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        className="flex flex-col items-center text-center sm:text-left sm:items-start"
      >
        <div className="text-[11px] tracking-[0.12em] text-[#4F8EF7] font-medium uppercase mb-3">Our story</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-6">What started as an SDG project became a mission</h2>
        
        <div className="space-y-5 text-[1rem] leading-[1.85] text-[#374151]">
          <p>
            Welcome to ScholarSearch. What started as an SDG (Sustainable Development Goals) project quickly turned into a mission to help our peers. As students ourselves, we know firsthand how overwhelming it can be to hunt for financial aid. Scrolling through endless pages, missing deadlines, and confusing eligibility criteria can make the scholarship search exhausting.
          </p>
          <p>
            We built this platform to change that. ScholarSearch is designed to simplify the process, bringing the best and most relevant scholarship opportunities into one easy-to-use directory.
          </p>
        </div>

        <blockquote className="mt-6 border-l-[3px] border-[#4F8EF7] pl-5 text-[1.1rem] italic text-[#185FA5]">
          "Financial constraints should never stand in the way of a deserving student's academic dreams."
        </blockquote>
      </motion.section>

      {/* 04. TEAM SECTION */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="text-center sm:text-left mb-8">
          <div className="text-[11px] tracking-[0.12em] text-[#4F8EF7] font-medium uppercase mb-3">Who we are</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-3">The developer behind ScholarSearch</h2>
          <p className="text-[#4a5568] max-w-2xl">
            A first-year engineering student from Christ College of Engineering, Irinjalakuda — passionate about using technology to solve real-world problems.
          </p>
        </div>

        <div className="flex justify-center">
          {[
            { name: "Ajvad K P", bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)", in: "AK", linkedin: "https://www.linkedin.com/in/ajvad-kp-a1259a384" },
          ].map((member, i) => (
            <motion.a
              key={member.name}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }
              } as Variants}
              whileHover={{ y: -6, scale: 1.03, boxShadow: '0 20px 40px rgba(79,142,247,0.15)' }}
              whileTap={{ scale: 0.97 }}
              className="glass-card p-6 flex flex-col items-center text-center cursor-pointer group w-full max-w-[280px] no-underline"
              style={{ transition: 'box-shadow 0.3s ease' }}
            >
              <div 
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[18px] font-medium text-gray-800 transition-transform duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-[#4F8EF7]/20 mb-3"
                style={{ background: member.bg }}
              >
                {member.in}
              </div>
              <h3 className="text-[15px] font-medium text-[#1a1a2e] mb-1">{member.name}</h3>
              <p className="text-[12px] text-[#6b7280] mb-3">Christ College of Engineering</p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0A66C2] opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Connect on LinkedIn
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* 05. MISSION SECTION */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="bg-[#dbeafe]/45 backdrop-blur-[16px] border border-white/65 rounded-[20px] p-6 sm:p-10 text-center sm:text-left">
          <div className="text-[11px] tracking-[0.12em] text-[#4F8EF7] font-medium uppercase mb-3">Our mission</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-4">Democratize access to education</h2>
          <p className="text-[#374151] leading-relaxed mb-10 max-w-3xl">
            Our mission is simple: every deserving student deserves a fair shot at their academic dreams. Financial constraints should never be a barrier. By centralizing scholarship information and making it searchable, filterable, and personalized, ScholarSearch ensures that the right opportunities find the right students.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Search, label: "Centralized search", sub: "One place for all scholarships", color: "#4F8EF7" },
              { icon: SlidersHorizontal, label: "Smart filtering", sub: "Find what matches you", color: "#34C48B" },
              { icon: Heart, label: "Student-first", sub: "Built by students, for students", color: "#8B5CF6" }
            ].map((pillar) => (
              <div key={pillar.label} className="flex flex-col items-center text-center">
                <motion.div
                  whileInView={{ scale: [1, 1.15, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mb-2"
                >
                  <pillar.icon size={22} style={{ color: pillar.color }} />
                </motion.div>
                <h4 className="font-medium text-[14px] text-[#1a1a2e] mb-1">{pillar.label}</h4>
                <p className="text-[12px] text-[#6b7280]">{pillar.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 06. SDG BADGE */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        className="flex justify-center"
      >
        <div className="inline-flex flex-col sm:flex-row items-center sm:items-center gap-3 max-w-[480px] bg-white/60 border border-[#4F8EF7]/25 rounded-3xl sm:rounded-full px-6 py-3 text-center sm:text-left">
          <div className="w-[28px] h-[28px] bg-[#E5243B] rounded-[4px] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
            SDG
          </div>
          <span className="text-[13px] text-[#374151] font-medium">
            This project supports UN SDG Goal 4 — Quality Education
          </span>
        </div>
      </motion.section>

      {/* 07. CONTACT SECTION */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        className="pb-8 text-center"
      >
        <div className="text-[11px] tracking-[0.12em] text-[#4F8EF7] font-medium uppercase mb-3">Get in touch</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-4">Have a question?</h2>
        <p className="text-[#4a5568] max-w-xl mx-auto mb-6">
          Found a bug, have a suggestion, or know of a scholarship we should add to our database? We'd love to hear from you.
        </p>
        <a href="/contact" className="inline-flex items-center justify-center bg-[#4F8EF7] hover:bg-[#3B7DE8] text-white rounded-xl px-8 py-3.5 font-medium text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
          Go to Contact Page →
        </a>
      </motion.section>
    </div>
  )
}
