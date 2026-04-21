import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
    case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
    default: return <Package className="w-5 h-5 text-gray-400" />;
  }
};

export default function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return <div className="pt-40 text-center">Please login to view orders.</div>;

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <h1 className="text-5xl font-black tracking-tighter italic mb-12 uppercase">YOUR ORDERS.</h1>

         {loading ? (
           <div className="space-y-6">
             {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />)}
           </div>
         ) : orders.length > 0 ? (
           <div className="space-y-6">
             {orders.map((order) => (
               <motion.div 
                 key={order.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
               >
                 <div className="mb-6 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                       <StatusIcon status={order.status} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{order.status}</span>
                    </div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-xs text-gray-400 font-bold mb-4">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="flex -space-x-4 overflow-hidden">
                       {order.items.map((item, i) => (
                         <img 
                           key={i} 
                           src={item.images[0]} 
                           className="w-12 h-12 rounded-full border-4 border-white object-cover" 
                           referrerPolicy="no-referrer"
                         />
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-col md:items-end">
                    <p className="text-3xl font-black tracking-tighter mb-4">${order.total}</p>
                    <button className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-black hover:text-amber-600 transition-colors">
                       <span>Track Order</span>
                       <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
               </motion.div>
             ))}
           </div>
         ) : (
           <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4">No orders yet</h3>
              <Link to="/products" className="text-amber-600 font-black uppercase tracking-widest text-sm">Start Shopping</Link>
           </div>
         )}
      </div>
    </div>
  );
}
