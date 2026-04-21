export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: "Running" | "Lifestyle" | "Basketball" | "Training";
  sizes: number[];
  stock: number;
  createdAt: string;
}

export interface CartItem extends Product {
  selectedSize: number;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
  };
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
