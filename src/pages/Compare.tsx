import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Product, Review } from '../types';
import { useStore } from '../store/useStore';
import { Trash2, ShoppingBag, ArrowLeft, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface RatingSummary {
  [productId: string]: {
    average: number;
    count: number;
  };
}

export default function Compare() {
  const { compareList, toggleCompare, clearCompare, addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [ratings, setRatings] = useState<RatingSummary>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompareItems = async () => {
      if (compareList.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const filtered = all.filter(p => compareList.includes(p.id));
        setProducts(filtered);

        // Fetch ratings for these products
        const ratingsData: RatingSummary = {};
        for (const p of filtered) {
          const q = query(collection(db, 'reviews'), where('productId', '==', p.id));
          const reviewSnap = await getDocs(q);
          const productReviews = reviewSnap.docs.map(doc => doc.data() as Review);
          
          if (productReviews.length > 0) {
            const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
            ratingsData[p.id] = {
              average: Number((sum / productReviews.length).toFixed(1)),
              count: productReviews.length
            };
          } else {
            ratingsData[p.id] = { average: 0, count: 0 };
          }
        }
        setRatings(ratingsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompareItems();
  }, [compareList]);

  if (loading) return (
    <div className="pt-32 flex justify-center min-h-screen items-center">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
             <button 
               onClick={() => navigate(-1)}
               className="flex items-center space-x-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-4 group"
             >
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               <span>Back</span>
             </button>
             <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-2">Comparison Tool</p>
             <h1 className="text-5xl font-black tracking-tighter italic uppercase underline underline-offset-8 decoration-gray-200">Side by Side.</h1>
          </div>
          
          {products.length > 0 && (
            <button 
              onClick={clearCompare}
              className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
            >
              Clear All Items
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[40px] border border-gray-100 shadow-sm">
             <div className="p-6 bg-gray-50 w-fit mx-auto rounded-full mb-8">
                <Trash2 className="w-12 h-12 text-gray-200" />
             </div>
             <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">No items to compare.</h3>
             <p className="text-gray-500 mb-10 max-w-xs mx-auto text-sm leading-relaxed">Select up to 4 sneakers from the shop to see how they stack up against each other.</p>
             <Link to="/products" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl inline-block hover:bg-amber-600 transition-all">Go to Shop</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px] bg-white rounded-[40px] border border-gray-100 shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="p-8 text-left text-xs font-black uppercase tracking-widest text-gray-400 w-1/5">Features</th>
                    {products.map(p => (
                      <th key={p.id} className="p-8 w-1/5 group">
                        <div className="relative">
                          <button 
                            onClick={() => toggleCompare(p.id)}
                            className="absolute -top-4 -right-4 p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link to={`/products/${p.id}`} className="block">
                            <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-2xl mb-6 shadow-sm group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 leading-tight mb-2">{p.name}</h3>
                            <p className="text-lg font-black text-amber-600">${p.price}</p>
                          </Link>
                        </div>
                      </th>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => (
                      <th key={`empty-${i}`} className="p-8 w-1/5">
                        <div className="aspect-square rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                           <Link to="/products" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline decoration-black/20 decoration-2 underline-offset-4">+ Add Item</Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="p-8 text-xs font-black uppercase tracking-widest text-gray-400">Community Rating</td>
                    {products.map(p => {
                      const r = ratings[p.id];
                      return (
                        <td key={p.id} className="p-8">
                           {r && r.count > 0 ? (
                             <div className="flex flex-col space-y-1">
                               <div className="flex items-center space-x-1">
                                 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                 <span className="text-sm font-black italic">{r.average}</span>
                               </div>
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.count} Reviews</span>
                             </div>
                           ) : (
                             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No ratings</span>
                           )}
                        </td>
                      );
                    })}
                    {Array.from({ length: 4 - products.length }).map((_, i) => <td key={`e-${i}`} className="p-8" />)}
                  </tr>
                  <tr>
                    <td className="p-8 text-xs font-black uppercase tracking-widest text-gray-400">Category</td>
                    {products.map(p => (
                      <td key={p.id} className="p-8 text-sm font-bold uppercase tracking-tight text-gray-900">{p.category}</td>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => <td key={`e-${i}`} className="p-8" />)}
                  </tr>
                  <tr>
                    <td className="p-8 text-xs font-black uppercase tracking-widest text-gray-400">Available Sizes</td>
                    {products.map(p => (
                      <td key={p.id} className="p-8 flex flex-wrap gap-1">
                        {p.sizes.map(s => <span key={s} className="text-[10px] px-2 py-1 bg-gray-100 rounded-md font-bold">{s}</span>)}
                      </td>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => <td key={`e-${i}`} className="p-8" />)}
                  </tr>
                  <tr>
                    <td className="p-8 text-xs font-black uppercase tracking-widest text-gray-400">Stock Status</td>
                    {products.map(p => (
                      <td key={p.id} className="p-8">
                        {p.stock > 0 ? (
                          <span className="text-xs font-black text-green-500 uppercase tracking-widest">In Stock ({p.stock})</span>
                        ) : (
                          <span className="text-xs font-black text-red-500 uppercase tracking-widest">Sold Out</span>
                        )}
                      </td>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => <td key={`e-${i}`} className="p-8" />)}
                  </tr>
                  <tr>
                    <td className="p-8 text-xs font-black uppercase tracking-widest text-gray-400">Description</td>
                    {products.map(p => (
                      <td key={p.id} className="p-8">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{p.description}</p>
                      </td>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => <td key={`e-${i}`} className="p-8" />)}
                  </tr>
                  <tr>
                    <td className="p-8 text-xs font-black uppercase tracking-widest text-gray-400">Actions</td>
                    {products.map(p => (
                      <td key={p.id} className="p-8">
                         <button 
                           onClick={() => addToCart(p, p.sizes[0])}
                           disabled={p.stock === 0}
                           className="w-full bg-black text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-amber-600 transition-all shadow-xl disabled:opacity-50"
                         >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                         </button>
                      </td>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => <td key={`e-${i}`} className="p-8" />)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
