import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Firestore can only do 'in' with max 10/30 items depending on quota, 10 is safest
        // For simplicity and since wishlist is usually small, we fetch chunks or all and filter
        const snapshot = await getDocs(collection(db, 'products'));
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(all.filter(p => wishlist.includes(p.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistItems();
  }, [wishlist]);

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
           <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Saved Items</p>
           <h1 className="text-5xl font-black tracking-tighter italic uppercase">YOUR WISHLIST.</h1>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-white rounded-3xl animate-pulse" />)}
           </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[40px] border border-gray-100">
             <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
             <h3 className="text-2xl font-bold mb-4 italic uppercase tracking-tight">Your wishlist is empty.</h3>
             <p className="text-gray-500 mb-10 max-w-xs mx-auto">Explore the collection and save your favorites for later.</p>
             <Link to="/products" className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg">Start Exploring</Link>
          </div>
        )}
      </div>
    </div>
  );
}
