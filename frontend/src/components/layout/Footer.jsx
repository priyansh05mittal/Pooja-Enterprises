import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold mb-4"><span className="text-primary">Shop</span>Elite</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Premium multi-category shopping destination for bathroom fittings, electronics, home items and accessories.</p>
            <div className="flex gap-4 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-dark border border-dark-border rounded-lg hover:border-primary hover:text-primary transition-all cursor-pointer">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2.5">
              {[['Home', '/'], ['Products', '/products'], ['Cart', '/cart'], ['Orders', '/orders'], ['Profile', '/profile']].map(([label, to]) => (
                <li key={to}><Link to={to} className="text-gray-400 hover:text-primary transition-colors text-sm">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2.5">
              {['Bathroom Fittings', 'Electronics', 'Home & Living', 'Accessories', 'Kitchen'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?keyword=${cat}`} className="text-gray-400 hover:text-primary transition-colors text-sm">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              {[
                [Mail, 'poojaenterprvsesbundiraj@gmail.com'],
                [Phone, '+91 9530089255'],
                [MapPin, 'Bundi, Rajasthan, India'],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-gray-400 text-sm">
                  <Icon size={16} className="text-primary shrink-0" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Pooja Enterprises. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
