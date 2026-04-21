import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useEffect, useState } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const q = query(collection(db, 'products'), limit(4));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setFeaturedProducts(data);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center bg-[#0d0d0d]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-white/[0.03] italic tracking-tighter select-none">
            WALKIN
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full mb-6 border border-white/10">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">New Fall Collection '24</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8 italic">
                STEP INTO <br />
                <span className="text-amber-500">THE FUTURE.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                Engineered for performance, designed for the streets. Experience the ultimate blend of comfort and style with our latest drops.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/products"
                  className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/products?category=Lifestyle"
                  className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Browse Lifestyle
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-amber-500/20 blur-[120px] rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000"
                alt="Featured Sneaker"
                className="relative z-10 w-full drop-shadow-[0_35px_35px_rgba(255,255,255,0.1)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Truck />, title: "Express Delivery", desc: "Fast shipping worldwide. Track your order in real-time." },
              { icon: <Shield />, title: "Secure Checkout", desc: "Your security is our priority. Encrypted payments guaranteed." },
              { icon: <Zap />, title: "Instant Access", desc: "Join our membership for early access to exclusive drops." }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 border border-gray-100"
              >
                <div className="p-4 bg-black text-white rounded-2xl mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Drops */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-2">Editor's Choice</p>
                <h2 className="text-4xl font-black tracking-tighter">FEATURED DROPS</h2>
              </div>
              <Link to="/products" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-amber-600 hover:border-amber-600 transition-all">
                View All Collection
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[40px] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=2000"
              alt="Lifestyle"
              className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center p-12 md:p-24">
              <div className="max-w-xl">
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none italic">
                  THE LIFESTYLE <br />
                  <span className="text-amber-500">REVOLUTION.</span>
                </h2>
                <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                  More than just sneakers. It's a statement. Join the community and redefine your walk.
                </p>
                <Link 
                  to="/products?category=Lifestyle"
                  className="inline-flex items-center space-x-3 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-2xl"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
