import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/common/ProductCard';

const fetchProducts = (params) => api.get('/products', { params }).then(r => r.data);
const fetchCategories = () => api.get('/categories').then(r => r.data.categories);

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: 1,
  });

  useEffect(() => {
    setFilters(f => ({ ...f, keyword: searchParams.get('keyword') || '', category: searchParams.get('category') || '' }));
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts({ ...filters }),
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  const Skeleton = () => (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-7 w-1/3 rounded" />
        <div className="skeleton h-9 w-full rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {filters.keyword ? `Results for "${filters.keyword}"` : 'All Products'}
          </h1>
          {data && <p className="text-gray-400 text-sm mt-1">{data.total} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline py-2 px-4 text-sm">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input py-2 w-48 text-sm"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wide">Category</label>
                <select value={filters.category} onChange={e => updateFilter('category', e.target.value)} className="input py-2 text-sm">
                  <option value="">All Categories</option>
                  {(categoriesData || []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wide">Min Price (₹)</label>
                <input type="number" placeholder="0" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="input py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wide">Max Price (₹)</label>
                <input type="number" placeholder="100000" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="input py-2 text-sm" />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 })}
                  className="w-full btn-outline py-2 text-sm"
                >
                  <X size={15} /> Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
          : data?.products?.map(product => <ProductCard key={product._id} product={product} />)
        }
      </div>

      {!isLoading && (!data?.products || data.products.length === 0) && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-display text-2xl font-bold mb-2">No products found</h3>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setFilters(f => ({ ...f, page: p }))}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                filters.page === p ? 'bg-primary text-white' : 'bg-dark-card border border-dark-border hover:border-primary text-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
