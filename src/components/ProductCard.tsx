import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import Swal from 'sweetalert2';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart, compareList, toggleCompare } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const isComparing = compareList.includes(product.id);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.images[0] || `https://picsum.photos/seed/${product.id}/600/600`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Wishlist Button */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button 
            onClick={() => toggleWishlist(product.id)}
            className={cn(
              "p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300",
              isWishlisted ? "bg-red-500 text-white" : "bg-white/80 text-gray-900 hover:bg-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>
          
          <button 
            onClick={handleCompareToggle}
            className={cn(
              "p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300",
              isComparing ? "bg-amber-600 text-white" : "bg-white/80 text-gray-900 hover:bg-white"
            )}
            title="Compare"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add (Only if stock > 0) */}
        {product.stock > 0 && (
          <button 
            onClick={() => addToCart(product, product.sizes[0])}
            className="absolute bottom-4 left-4 right-4 bg-black text-white py-3 rounded-xl font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Quick Add</span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{product.category}</p>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{product.name}</h3>
            </Link>
          </div>
          <p className="text-sm font-black text-gray-900">${product.price}</p>
        </div>
      </div>
    </motion.div>
  );
}
