import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Message Sent',
      text: 'Thank you for reaching out. Our team will get back to you within 24 hours.',
      confirmButtonColor: '#000'
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-4 text-center">Get in Touch</p>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase mb-6 inline-block">CONTACT US.</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Have questions about a drop? Need help with an order? Our support team is here to help you step up your game.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: <Mail />, title: "Email Us", val: "support@walkin.com", sub: "24/7 priority support" },
                { icon: <Phone />, title: "Call Us", val: "+1 (555) WALKIN", sub: "Mon-Fri, 9am-6pm EST" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="p-3 bg-black text-white w-fit rounded-xl mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{item.title}</h3>
                  <p className="text-lg font-black tracking-tight mb-1">{item.val}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-black text-white p-10 rounded-[40px] relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="flex items-center space-x-3 mb-6">
                   <div className="p-2 bg-white/10 rounded-lg">
                     <MapPin className="w-5 h-5" />
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-white">Headquarters</h3>
                 </div>
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-tight">Walkin Global Hub <br />Los Angeles, CA</h2>
                 <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">Visit our flagship concept store for exclusive in-person releases and custom fit sessions.</p>
                 <a href="#" className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-amber-500 hover:text-white transition-colors underline underline-offset-8">
                   Get Directions
                 </a>
               </div>
               <div className="absolute top-0 right-0 p-10 text-[10vw] font-black italic text-white/[0.03] leading-none select-none">
                 HQ
               </div>
            </div>
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Your Name</label>
                  <input required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Email Address</label>
                  <input required type="email" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Subject</label>
                <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black appearance-none transition-all">
                  <option>Order Inquiry</option>
                  <option>Product Question</option>
                  <option>Returns & Exchanges</option>
                  <option>Wholesale & Press</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Message</label>
                <textarea required rows={6} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black resize-none transition-all" placeholder="How can we help you?" />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-amber-600 transition-all shadow-2xl group"
              >
                <span>Send Message</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
