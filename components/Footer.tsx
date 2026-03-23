import Link from "next/link";
import { GlowBlob } from "./GlobalUI";
import { Instagram, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background pt-24 pb-8 overflow-hidden mt-32">
      <GlowBlob className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-30" />
      
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="font-syne font-bold text-3xl text-white block mb-4">Kyrosh.</Link>
          <p className="text-text_muted font-sans text-sm">We Don't Just Market. We Move People.</p>
        </div>
        
        <div>
          <h4 className="font-syne font-semibold text-white mb-6">Pages</h4>
          <ul className="space-y-3 font-sans text-sm text-text_secondary">
            {['Home', 'Work', 'Services', 'About', 'Contact'].map(link => (
              <li key={link}><Link href={`/${link === 'Home' ? '' : link.toLowerCase()}`} className="hover:text-primary transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-syne font-semibold text-white mb-6">Services</h4>
          <ul className="space-y-3 font-sans text-sm text-text_secondary">
            {['Video Production', 'Social Media', 'Instagram Growth', 'School Marketing', 'Brand Partnerships'].map(service => (
              <li key={service} className="hover:text-primary transition-colors cursor-pointer">{service}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-syne font-semibold text-white mb-6">Connect</h4>
          <ul className="space-y-4 font-sans text-sm text-text_secondary">
            <li><a href="#" className="flex items-center gap-3 hover:text-primary transition-colors"><Instagram className="w-4 h-4" /> Instagram</a></li>
            <li><a href="#" className="flex items-center gap-3 hover:text-primary transition-colors"><MessageCircle className="w-4 h-4" /> WhatsApp</a></li>
            <li><a href="mailto:hello@kyrosh.com" className="flex items-center gap-3 hover:text-primary transition-colors"><Mail className="w-4 h-4" /> Email</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs font-sans text-text_muted">
        <p>© 2025 Kyrosh. All Rights Reserved.</p>
        <p>Made with purpose.</p>
      </div>
    </footer>
  );
}