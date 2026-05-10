import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, ShoppingBag, Zap, Shield, Truck } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import api from '../../api/axios';
import ProductCard from '../../components/common/ProductCard';

const fetchBanners = () => api.get('/banners/active').then(r => r.data.banners);
const fetchFeatured = () => api.get('/products?featured=true&limit=8').then(r => r.data.products);
const fetchCategories = () => api.get('/categories').then(r => r.data.categories);

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹500' },
  { icon: Shield, title: 'Secure Payment', desc: 'Razorpay & COD' },
  { icon: Zap, title: 'Fast Delivery', desc: '2-5 business days' },
  { icon: ShoppingBag, title: 'Easy Returns', desc: '7-day return policy' },
];

export default function Home() {
  const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: fetchBanners });
  const { data: featured = [] } = useQuery({ queryKey: ['featured'], queryFn: fetchFeatured });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const handleBannerClick = async (banner) => {
    await api.post(`/banners/${banner._id}/click`).catch(() => {});
    if (banner.redirectType === 'url' && banner.redirectValue) window.open(banner.redirectValue, '_blank');
  };

  return (
    <div>
      {/* Hero Banner */}
      {banners.length > 0 ? (
        <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 4000 }} pagination={{ clickable: true }} navigation loop className="h-[420px] sm:h-[520px]">
          {banners.map(banner => (
            <SwiperSlide key={banner._id}>
              <div onClick={() => handleBannerClick(banner)} className="relative h-full cursor-pointer overflow-hidden">
                <img src={banner.image?.url} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/40 to-transparent flex items-center">
                  <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
                      <p className="text-primary font-medium text-sm mb-3 tracking-widest uppercase">{banner.subtitle}</p>
                      <h1 className="font-display text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">{banner.title}</h1>
                      <Link to="/products" className="btn-primary text-base">
                        Shop Now <ArrowRight size={18} />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="relative h-[420px] sm:h-[520px] bg-gradient-to-br from-dark-card via-dark to-accent flex items-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-primary" style={{ width: Math.random() * 200 + 50, height: Math.random() * 200 + 50, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }} />
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-6 relative">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
              <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">Welcome to Pooja Enterprises</p>
              <h1 className="font-display text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
                Premium<br /><span className="text-primary">Products</span><br />Delivered
              </h1>
              <Link to="/products" className="btn-primary text-base">
                Explore Now <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Features Strip */}
      <div className="bg-dark-card border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary text-sm font-medium mb-1 tracking-wide uppercase">Browse</p>
              <h2 className="font-display text-3xl font-bold">Categories</h2>
            </div>
            <Link to="/products" className="text-primary hover:text-primary-light text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat, i) => (
              <motion.div key={cat._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link to={`/products?category=${cat._id}`} className="group block text-center">
                  <div className="aspect-square rounded-2xl bg-dark-card border border-dark-border overflow-hidden mb-3 group-hover:border-primary/50 transition-all">
                    {cat.image?.url ? (
                      <img src={cat.image.url} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent">
                        <ShoppingBag size={32} className="text-primary" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary text-sm font-medium mb-1 tracking-wide uppercase">Hand Picked</p>
              <h2 className="font-display text-3xl font-bold">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="text-primary hover:text-primary-light text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 via-dark-card to-accent border border-primary/20 p-10 sm:p-16 text-center"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-3xl" />
          </div>
          <div className="relative">
            <p className="text-primary font-medium mb-2 tracking-widest uppercase text-sm">Limited Time Offer</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Up to <span className="text-primary">50% Off</span></h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">Discover incredible deals on premium products across all categories. Don't miss out!</p>
            <Link to="/products" className="btn-primary text-base">
              Shop the Sale <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
