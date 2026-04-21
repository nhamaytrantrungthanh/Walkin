import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, user, clearCart } = useStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; type: 'percentage' | 'fixed' | 'shipping'; value: number } | null>(null);
  
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.displayName || '',
    address: '',
    city: '',
    zipCode: ''
  });

  const DISCOUNT_CODES = [
    { code: 'WALKIN10', type: 'percentage', value: 0.1 },
    { code: 'SAVE20', type: 'percentage', value: 0.2 },
    { code: 'FREESHIP', type: 'shipping', value: 0 },
  ];

  const handleApplyPromo = () => {
    const code = DISCOUNT_CODES.find(c => c.code === promoCode.toUpperCase());
    if (code) {
      setAppliedDiscount(code as any);
      Swal.fire({
        icon: 'success',
        title: 'Discount Applied!',
        text: `Code ${code.code} has been applied to your order.`,
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: 'The promo code you entered is invalid or expired.',
        confirmButtonColor: '#000'
      });
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discountAmount = 0;
  if (appliedDiscount?.type === 'percentage') {
    discountAmount = subtotal * appliedDiscount.value;
  }
  
  const shipping = (subtotal > 100 || appliedDiscount?.type === 'shipping') ? 0 : 15;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleCheckout = async () => {
    if (!user) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please sign in to complete your order.',
        showCancelButton: true,
        confirmButtonText: 'Login',
        confirmButtonColor: '#000'
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }

    if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.city || !shippingDetails.zipCode) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please fill in all shipping address fields before checking out.',
        confirmButtonColor: '#000'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Order',
      text: "Are you sure you want to place this order?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#000',
      confirmButtonText: 'Yes, Place Order'
    });

    if (result.isConfirmed) {
      try {
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          items: cart,
          total: total,
          status: 'pending',
          shippingAddress: shippingDetails,
          createdAt: new Date().toISOString()
        });

        Swal.fire({
          icon: 'success',
          title: 'Order Placed!',
          text: 'Thank you for your purchase. We will notify you when it ships.',
          confirmButtonColor: '#000'
        });
        clearCart();
        navigate('/orders');
      } catch (err) {
        Swal.fire('Error', 'Failed to place order. Please try again.', 'error');
      }
    }
  };

  if (cart.length === 0) return (
    <div className="pt-40 pb-20 px-4 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="p-8 bg-gray-50 rounded-full mb-8">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
      </div>
      <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase text-black">Your cart is empty.</h2>
      <p className="text-gray-500 mb-10 max-w-xs">Looks like you haven't added any heat to your cart yet. Let's fix that.</p>
      <Link 
        to="/products"
        className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl"
      >
        Go to Shop
      </Link>
    </div>
  );

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black tracking-tighter italic mb-12 uppercase">YOUR BAG.</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items & Shipping List */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-4">Cart Items</h2>
              {cart.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.selectedSize}`}
                  layout
                  className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 shadow-sm"
                >
                  <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  <div className="flex-grow flex flex-col sm:flex-row justify-between w-full">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-[10px] font-black tracking-[0.2em] text-amber-600 uppercase mb-1">{item.category}</p>
                      <h3 className="text-lg font-black tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                      <p className="text-sm font-bold text-gray-400 mt-1 uppercase">Size {item.selectedSize}</p>
                      
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center border border-gray-100 rounded-xl px-2 py-1 bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:text-amber-600 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input 
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                updateQuantity(item.id, item.selectedSize, Math.min(Math.max(1, val), item.stock));
                              }
                            }}
                            className="w-10 text-center text-sm font-black bg-transparent border-none focus:ring-0 p-0"
                          />
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, Math.min(item.stock, item.quantity + 1))}
                            className="p-1 hover:text-amber-600 transition-colors disabled:opacity-30"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-black">${item.price * item.quantity}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">${item.price} per unit</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Shipping Address Form */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black"
                    placeholder="Enter recipient's full name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black"
                    placeholder="Enter street name and number"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={shippingDetails.zipCode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, zipCode: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black"
                    placeholder="Enter zip code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8">Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-black">${subtotal}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-bold uppercase tracking-widest flex items-center">
                      Discount ({appliedDiscount.code})
                    </span>
                    <span className="font-black">-${Math.round(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Estimated Shipping</span>
                  <span className="font-black tracking-widest">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-black">FREE</span>
                    ) : (
                      `$${shipping}`
                    )}
                  </span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="mb-8">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="PROMO CODE" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-1 focus:ring-black"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-gray-100 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <button 
                    onClick={() => {
                      setAppliedDiscount(null);
                      setPromoCode('');
                    }}
                    className="mt-2 text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest transition-colors flex items-center"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove Code
                  </button>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 mb-10">
                <div className="flex justify-between items-end">
                   <span className="text-xs font-black uppercase tracking-[0.2em]">Total</span>
                   <span className="text-4xl font-black tracking-tighter">${total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-amber-600 transition-all shadow-2xl group"
              >
                <span>Checkout</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-10 space-y-4 pt-6 border-t border-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Secure Payment</p>
                    <p className="text-[10px] text-gray-400">SSL Encrypted processing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Global Logistics</p>
                    <p className="text-[10px] text-gray-400">DPD & DHL Express</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Authenticity</p>
                    <p className="text-[10px] text-gray-400">100% genuine sneakers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black text-white p-8 rounded-[40px] relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">Member perk</p>
                 <h3 className="text-2xl font-black tracking-tighter mb-4 italic uppercase">Early access <br />to drops.</h3>
                 <Link to="/register" className="text-xs font-bold underline uppercase tracking-widest hover:text-amber-500 transition-colors">Join the family</Link>
               </div>
               <div className="absolute -bottom-8 -right-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag className="w-32 h-32" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
