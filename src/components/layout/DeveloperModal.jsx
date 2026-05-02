import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  GitBranch, 
  Camera, 
  Globe, 
  Briefcase, 
  Mail, 
  ExternalLink,
  Code2,
  Heart,
  Cpu
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function DeveloperModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-slate-900 border-white/10 rounded-[32px] shadow-2xl">
        <div className="relative">
          {/* Header/Cover */}
          <div className="h-32 bg-gradient-to-r from-primary/80 via-primary to-blue-600 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
             <div className="absolute top-4 right-4">
               <button onClick={onClose} className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
                 <X className="w-4 h-4" />
               </button>
             </div>
          </div>

          {/* Profile Picture (Placeholder) */}
          <div className="absolute top-20 left-8">
             <div className="w-24 h-24 rounded-3xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center overflow-hidden shadow-xl">
                <Cpu className="w-12 h-12 text-primary" />
             </div>
          </div>

          {/* Content */}
          <div className="px-8 pt-16 pb-8 space-y-6">
             <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Ido Refael Siregar</h3>
                  <div className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black text-primary uppercase">Developer</div>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                  Seorang pengembang web.
                </p>
             </div>

             <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                   <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">NIM</p>
                      <p className="text-xs font-bold text-slate-200">2457301067</p>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Program Studi</p>
                      <p className="text-xs font-bold text-slate-200">D4 Sistem Informasi</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Institusi</p>
                      <p className="text-xs font-bold text-slate-200">Politeknik Caltex Riau</p>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 text-center sm:text-left">Terhubung dengan saya :</p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                   <SocialBtn icon={Briefcase} label="LinkedIn" href="https://www.linkedin.com/in/ido-refael-siregar-b27920367" />
                   <SocialBtn icon={GitBranch} label="GitHub" href="https://github.com/idosiregar24" />
                   <SocialBtn icon={Camera} label="Instagram" href="https://www.instagram.com/ido_refsiregar?igsh=dWQwYWhvZzlyMThy" />
                   <SocialBtn icon={Mail} label="Email" href="mailto:idosiregar2006@gmail.com" />
                </div>
             </div>

             <div className="pt-4 border-t border-white/5">
                <Button className="w-full h-12 rounded-2xl bg-white text-black font-black hover:bg-slate-200 transition-all flex items-center gap-2">
                   <Globe className="w-4 h-4" /> Visit Portfolio
                   <ExternalLink className="w-3 h-3 opacity-50" />
                </Button>
             </div>

             <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                Developed with ❤️ in Indonesia
             </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SocialBtn({ icon: Icon, label, href }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-primary hover:border-primary transition-all group"
      title={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  )
}
