import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { User, Mail, Shield, Calendar, Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useStore();

  if (!user) return <div className="pt-40 text-center">Please login to view profile.</div>;

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black tracking-tighter italic mb-12 uppercase">PROFILE.</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center space-x-6 mb-10">
                  <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center text-white text-4xl font-black italic">
                    {user.displayName?.[0] || user.email[0]}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase">{user.displayName || 'Sneakerhead'}</h2>
                    <p className="text-gray-400 font-bold text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member Status</p>
                      <p className="text-sm font-black uppercase text-amber-600">{user.role === 'admin' ? 'ELITE ADMIN' : 'VALUED MEMBER'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Joined Since</p>
                      <p className="text-sm font-black uppercase">{new Date(user.createdAt).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 text-[12vw] font-black italic text-gray-50 leading-none select-none -z-0">
                INFO
              </div>
            </motion.div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/orders" className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center">
                  <h3 className="font-black italic uppercase tracking-tight">Order History</h3>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link to="/wishlist" className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center">
                  <h3 className="font-black italic uppercase tracking-tight">Your Wishlist</h3>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-8">Settings</h3>
              <ul className="space-y-4">
                 <li>
                   <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-black hover:text-white transition-all group">
                     <span className="text-xs font-bold uppercase tracking-widest">Edit Profile</span>
                     <Settings className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                   </button>
                 </li>
                 <li>
                   <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-black hover:text-white transition-all group">
                     <span className="text-xs font-bold uppercase tracking-widest">Security</span>
                   </button>
                 </li>
              </ul>
            </div>

            {user.role === 'admin' && (
              <div className="bg-indigo-600 text-white p-8 rounded-[40px] shadow-xl shadow-indigo-200">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-4">Admin Hub</h3>
                <h4 className="text-xl font-black italic uppercase mb-6 leading-tight">Manage the <br />entire store.</h4>
                <Link to="/admin" className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Launch Console</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
