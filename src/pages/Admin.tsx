import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Save, X, Package, DollarSign, Tag, Layers, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

const CATEGORIES = ["Running", "Lifestyle", "Basketball", "Training"];

export default function Admin() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    images: [''],
    category: 'Lifestyle',
    sizes: [7, 8, 9, 10, 11, 12],
    stock: 10
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, navigate]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...newProduct,
        createdAt: new Date().toISOString()
      });
      setProducts([{ id: docRef.id, ...newProduct } as Product, ...products]);
      setIsAdding(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        images: [''],
        category: 'Lifestyle',
        sizes: [7, 8, 9, 10, 11, 12],
        stock: 10
      });
      Swal.fire('Success', 'Product added successfully!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to add product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
        Swal.fire('Deleted!', 'Product has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete product', 'error');
      }
    }
  };

  const handleSeed = async () => {
    const seedProducts = [
      {
        name: "WALKIN AIR MAX 90",
        description: "A classic reborn. The Air Max 90 delivers ultimate comfort and street-ready style.",
        price: 130,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000"],
        category: "Lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        stock: 50,
        createdAt: new Date().toISOString()
      },
      {
        name: "STREET GLIDE 400",
        description: "Built for speed. Breathable mesh upper meets a responsive foam sole.",
        price: 160,
        images: ["https://images.unsplash.com/photo-1551107646-36bd4e2456f5?auto=format&fit=crop&q=80&w=1000"],
        category: "Running",
        sizes: [8, 9, 10, 11],
        stock: 25,
        createdAt: new Date().toISOString()
      },
      {
        name: "COURT KING HIGH",
        description: "Dominate the court. High-top support with superior grip technology.",
        price: 180,
        images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000"],
        category: "Basketball",
        sizes: [9, 10, 11, 12, 13],
        stock: 15,
        createdAt: new Date().toISOString()
      },
      {
        name: "URBAN NOMAD V2",
        description: "Sleek, minimal, essential. The perfect companion for the urban explorer.",
        price: 110,
        images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=1000"],
        category: "Lifestyle",
        sizes: [7, 8, 9, 10, 11],
        stock: 40,
        createdAt: new Date().toISOString()
      },
      {
        name: "VOID RUNNER Z",
        description: "Push your limits with cutting-edge cushioning technology.",
        price: 210,
        images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1000"],
        category: "Running",
        sizes: [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
        stock: 30,
        createdAt: new Date().toISOString()
      },
      {
        name: "APEX TRAINER PRO",
        description: "The ultimate training shoe for heavy lifts and high-intensity workouts.",
        price: 145,
        images: ["https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=1000"],
        category: "Training",
        sizes: [8, 9, 10, 11, 12],
        stock: 20,
        createdAt: new Date().toISOString()
      },
      {
        name: "RETRO FLOW 85",
        description: "Vintage inspired design meets modern comfort technology.",
        price: 125,
        images: ["https://images.unsplash.com/photo-1584735170091-a18382c67b45?auto=format&fit=crop&q=80&w=1000"],
        category: "Lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        stock: 60,
        createdAt: new Date().toISOString()
      },
      {
        name: "DUNK MASTER X",
        description: "Explosive energy return for high-flying basketball players.",
        price: 195,
        images: ["https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1000"],
        category: "Basketball",
        sizes: [9, 10, 11, 12, 13, 14],
        stock: 12,
        createdAt: new Date().toISOString()
      },
      {
        name: "ZENITH CROSS",
        description: "Versatile performance for hybrid athletes.",
        price: 140,
        images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1000"],
        category: "Training",
        sizes: [8, 9, 10, 11, 12],
        stock: 35,
        createdAt: new Date().toISOString()
      },
      {
        name: "LUNAR GLIDE",
        description: "Weightless feel for your daily runs.",
        price: 175,
        images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1000"],
        category: "Running",
        sizes: [7, 8, 9, 10, 11],
        stock: 22,
        createdAt: new Date().toISOString()
      },
      {
        name: "VELOCITY ELITE",
        description: "Record-breaking technology for competitive racing.",
        price: 250,
        images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=1000"],
        category: "Running",
        sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11],
        stock: 10,
        createdAt: new Date().toISOString()
      },
      {
        name: "CLOUD STRATUS",
        description: "Maximum cushioning for recovery days and long walks.",
        price: 155,
        images: ["https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=1000"],
        category: "Lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        stock: 45,
        createdAt: new Date().toISOString()
      }
    ];

    setLoading(true);
    try {
      for (const p of seedProducts) {
        await addDoc(collection(db, 'products'), p);
      }
      Swal.fire('Success', 'Store seeded with initial inventory!', 'success');
      window.location.reload();
    } catch (err) {
      Swal.fire('Error', 'Failed to seed store', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Management Suite</p>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase">Admin Console.</h1>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleSeed}
              className="bg-gray-200 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-300 transition-all"
            >
              Seed Data
            </button>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-amber-600 transition-all shadow-xl"
            >
              {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{isAdding ? "Cancel" : "Add New Product"}</span>
            </button>
          </div>
        </div>

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl mb-12"
          >
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Product Name</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black"
                      placeholder="e.g. UltraBoost Runner X"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black"
                      placeholder="e.g. 150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <select 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Image URL</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      value={newProduct.images?.[0]}
                      onChange={e => setNewProduct({...newProduct, images: [e.target.value]})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Description</label>
                  <textarea 
                    rows={4}
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black resize-none"
                    placeholder="Describe the aesthetic and performance..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl"
                >
                  Confirm & Upload
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Inventory List */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Stock</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 uppercase font-black">{p.category}</td>
                  <td className="px-8 py-6 font-black">${p.price}</td>
                  <td className="px-8 py-6 text-sm font-bold">{p.stock} units</td>
                  <td className="px-8 py-6">
                    <div className="flex space-x-3">
                      <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-black hover:bg-gray-100 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 bg-red-50 text-red-400 rounded-lg hover:text-white hover:bg-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
