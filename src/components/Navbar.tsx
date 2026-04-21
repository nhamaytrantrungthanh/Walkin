import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, cart, setUser, compareList } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tighter text-black italic">WALKIN.</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Shop All</Link>
            <Link to="/products?category=Lifestyle" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Lifestyle</Link>
            <Link to="/products?category=Running" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Running</Link>
            <Link to="/products?category=Basketball" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">Basketball</Link>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-5">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 text-xs bg-gray-50 border-none rounded-full focus:ring-1 focus:ring-black transition-all w-32 focus:w-48"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>

            <Link to="/compare" className="relative p-2 text-gray-700 hover:text-black transition-colors">
              <BarChart2 className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {compareList.length}
                </span>
              )}
            </Link>

            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-black transition-colors">
              <Heart className="w-5 h-5" />
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-black transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative group">
              <Link to="/profile" className="p-2 text-gray-700 hover:text-black transition-colors">
                <User className="w-5 h-5" />
              </Link>
              {user && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                  <div className="px-4 py-2 border-bottom border-gray-50 mb-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.displayName || user.email}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              {!user && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                  <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Login</Link>
                  <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Register</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 h-screen flex flex-col p-6 space-y-6 animate-in slide-in-from-top duration-300">
           <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
            
            <div className="flex flex-col space-y-4">
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-gray-900">Shop All</Link>
              <Link to="/products?category=Lifestyle" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-gray-900">Lifestyle</Link>
              <Link to="/products?category=Running" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-gray-900">Running</Link>
              <Link to="/products?category=Basketball" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-gray-900">Basketball</Link>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col space-y-4">
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 text-gray-700">
                <ShoppingCart className="w-6 h-6" />
                <span className="font-medium text-lg">Cart ({cartCount})</span>
              </Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 text-gray-700">
                <Heart className="w-6 h-6" />
                <span className="font-medium text-lg">Wishlist</span>
              </Link>
              {!user ? (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 text-gray-700">
                  <User className="w-6 h-6" />
                  <span className="font-medium text-lg">Login / Sign Up</span>
                </Link>
              ) : (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 text-gray-700">
                    <User className="w-6 h-6" />
                    <span className="font-medium text-lg">Profile</span>
                  </Link>
                   <button onClick={handleLogout} className="flex items-center space-x-3 text-red-600">
                    <LogOut className="w-6 h-6" />
                    <span className="font-medium text-lg">Logout</span>
                  </button>
                </>
              )}
            </div>
        </div>
      )}
    </nav>
  );
}
