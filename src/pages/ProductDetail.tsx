import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Review } from '../types';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { ShoppingBag, Heart, ArrowLeft, Shield, Truck, RefreshCcw, Star, Trash2, BarChart2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import Swal from 'sweetalert2';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, user, compareList, toggleCompare } = useStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const q = query(
        collection(db, 'reviews'), 
        where('productId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
        await fetchReviews();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (selectedSize === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Size',
        text: 'Please select a size before adding to cart.'
      });
      return;
    }

    addToCart(product, selectedSize);
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${product.name} (Size ${selectedSize}) has been added.`,
      showCancelButton: true,
      confirmButtonText: 'View Cart',
      cancelButtonText: 'Continue Shopping',
      confirmButtonColor: '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/cart');
      }
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      Swal.fire('Login Required', 'Please log in to leave a review.', 'info');
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) return;

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString()
      });
      setNewReview({ rating: 5, comment: '' });
      await fetchReviews();
      Swal.fire('Success', 'Thank you for your review!', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const result = await Swal.fire({
      title: 'Delete Review?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        setReviews(reviews.filter(r => r.id !== reviewId));
        Swal.fire('Deleted!', 'Review has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete review.', 'error');
      }
    }
  };

  if (loading) return (
    <div className="pt-32 flex justify-center min-h-screen items-center">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="pt-32 flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2 className="text-2xl font-bold">Product not found.</h2>
      <button onClick={() => navigate('/products')} className="text-amber-600 font-bold">Back to Shop</button>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);
  const isComparing = compareList.includes(product.id);

  const handleCompareToggle = () => {
    if (!product) return;
    if (!isComparing && compareList.length >= 4) {
      Swal.fire({
        icon: 'info',
        title: 'Comparison Limit',
        text: 'You can compare up to 4 products at a time.',
        confirmButtonColor: '#000'
      });
      return;
    }
    toggleCompare(product.id);
  };

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-20 border-b border-gray-100">
          {/* Images */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[40px] overflow-hidden bg-gray-50 border border-gray-100"
            >
              <img 
                src={product.images[activeImage] || `https://picsum.photos/seed/${product.id}/1000/1000`}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                    activeImage === i ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`${product.name} view ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
              {/* Fallback thumbnails if few images */}
              {product.images.length < 4 && Array.from({ length: 4 - product.images.length }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-50 border border-gray-100" />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-2">{product.category}</p>
              <h1 className="text-5xl font-black tracking-tighter mb-4 italic leading-tight uppercase">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                 <p className="text-2xl font-black text-gray-900">${product.price}</p>
                 {reviews.length > 0 && (
                   <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold">{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                   </div>
                 )}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-gray-400 text-sm mb-6 leading-relaxed">
                {product.description || "The WALKIN signature series combines heritage design with modern comfort. Engineered with breathable materials and a reactive sole, these sneakers are built for all-day performance."}
              </h3>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Select Size (US)</h3>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs font-bold text-gray-400 underline uppercase tracking-widest hover:text-black transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "py-4 rounded-xl text-sm font-bold transition-all border",
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-900 border-gray-100 hover:border-black"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-grow bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-amber-600 transition-all shadow-xl disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{product.stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "p-5 rounded-2xl border-2 transition-all flex items-center justify-center",
                  isWishlisted 
                    ? "bg-red-500 border-red-500 text-white" 
                    : "border-gray-100 text-gray-900 hover:border-black"
                )}
              >
                <Heart className={cn("w-6 h-6", isWishlisted && "fill-current")} />
              </button>
              <button
                onClick={handleCompareToggle}
                className={cn(
                  "p-5 rounded-2xl border-2 transition-all flex items-center justify-center",
                  isComparing 
                    ? "bg-amber-600 border-amber-600 text-white" 
                    : "border-gray-100 text-gray-900 hover:border-black"
                )}
                title="Compare"
              >
                <BarChart2 className="w-6 h-6" />
              </button>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCcw className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 py-12">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                 <h2 className="text-4xl font-black tracking-tighter italic uppercase mb-2">Customer Reviews.</h2>
                 <p className="text-gray-500">Real feedback from the Walkin community.</p>
              </div>
              {!user ? (
                 <button onClick={() => navigate('/login')} className="bg-gray-100 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                    Login to Write Review
                 </button>
              ) : (
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-amber-600">
                   Logged in to contribute
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Submission Form */}
              <div>
                 {user && (
                    <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                       <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 underline underline-offset-8">Post a review</h3>
                       <form onSubmit={handleReviewSubmit} className="space-y-6">
                          <div>
                             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Rating</label>
                             <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map(num => (
                                   <button 
                                      key={num} 
                                      type="button"
                                      onClick={() => setNewReview({ ...newReview, rating: num })}
                                      className="transition-transform active:scale-90"
                                   >
                                      <Star className={cn("w-6 h-6", num <= newReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                                   </button>
                                ))}
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Experience</label>
                             <textarea 
                                required
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                className="w-full p-4 bg-white border-none rounded-xl focus:ring-2 focus:ring-black resize-none min-h-[120px] text-sm"
                                placeholder="What did you think of the fit and feel?"
                             />
                          </div>
                          <button 
                             disabled={submittingReview}
                             className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-lg disabled:opacity-50"
                          >
                             {submittingReview ? "Posting..." : "Submit Review"}
                          </button>
                       </form>
                    </div>
                 )}
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-8">
                 {reviews.length > 0 ? (
                    reviews.map(review => (
                      <motion.div 
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-[32px] border border-gray-100 relative group shadow-sm hover:shadow-md transition-all"
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <div className="flex space-x-1 mb-2">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                     <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                                  ))}
                               </div>
                               <p className="text-sm font-black tracking-tight">{review.userName}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                               </p>
                            </div>
                            {user?.role === 'admin' && (
                               <button 
                                 onClick={() => handleDeleteReview(review.id)}
                                 className="opacity-0 group-hover:opacity-100 p-2 text-red-100 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            )}
                         </div>
                         <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </motion.div>
                    ))
                 ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No reviews yet for this product.</p>
                       <p className="text-gray-400 text-xs mt-2">Become the first to share your thoughts!</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-2">Reference</p>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-8">Size Guide.</h2>

              <div className="overflow-hidden border border-gray-100 rounded-3xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">US Men's</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Heel-to-Toe (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { us: "7", cm: "24.4" },
                      { us: "7.5", cm: "24.8" },
                      { us: "8", cm: "25.2" },
                      { us: "8.5", cm: "25.7" },
                      { us: "9", cm: "26.1" },
                      { us: "9.5", cm: "26.5" },
                      { us: "10", cm: "26.9" },
                      { us: "10.5", cm: "27.3" },
                      { us: "11", cm: "27.8" },
                      { us: "11.5", cm: "28.2" },
                      { us: "12", cm: "28.6" },
                      { us: "13", cm: "29.4" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-black">{row.us}</td>
                        <td className="px-6 py-3 text-sm font-bold text-gray-500">{row.cm} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Pro Tip</p>
                <p className="text-xs text-amber-900 leading-relaxed">Measurement refers to your actual foot length. If you're between sizes, we recommend sizing up for a more breathable fit.</p>
              </div>

              <button 
                onClick={() => setShowSizeGuide(false)}
                className="w-full mt-8 bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-lg"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

