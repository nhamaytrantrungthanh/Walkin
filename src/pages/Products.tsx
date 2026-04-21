import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ["All", "Running", "Lifestyle", "Basketball", "Training"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'Newest' | 'Price: Low' | 'Price: High'>('Newest');
  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        if (activeCategory !== 'All') {
          q = query(collection(db, 'products'), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Apply client-side sorting to avoid requiring multiple composite indexes for demo
        if (sortBy === 'Price: Low') {
          data = [...data].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High') {
          data = [...data].sort((a, b) => b.price - a.price);
        }
        
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, sortBy]);

  const setCategory = (cat: string) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 space-y-6 md:space-y-0">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4 italic uppercase">THE COLLECTION.</h1>
            <p className="text-gray-500 text-sm max-w-md">Discover our curated selection of high-performance and street-ready sneakers.</p>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all font-bold text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isFilterOpen && "rotate-180")} />
            </button>
            
            <div className="hidden md:flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 items-center">
              {(['Newest', 'Price: Low', 'Price: High'] as const).map(s => (
                <button 
                  key={s} 
                  onClick={() => setSortBy(s)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold transition-all rounded-lg",
                    sortBy === s ? "bg-black text-white" : "text-gray-500 hover:text-black"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                          activeCategory === cat 
                            ? "bg-black text-white" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['Newest', 'Price: Low', 'Price: High'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                          sortBy === s 
                            ? "bg-black text-white" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* More filters can be added here */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-3xl h-[400px] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
