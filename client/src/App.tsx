import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartDrawer, CartProvider, FavoritesProvider, SiteFooter, SiteHeader } from "./components/Storefront";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/Product";
import NotFound from "./pages/NotFound";
import { About, Contact, Deals, Favorites, Login, Account, NewArrivals } from "./pages/AdditionalPages";
import { PrivacyPolicy, TermsAndConditions, RefundPolicy, LicensePolicy, FAQ, Support } from "./pages/ContentPages";
import { BestSellers, Bundles, FreeResources, Categories } from "./pages/AdditionalPages";
import AdminDashboard from "./pages/Admin";
import CategoryPage from "./pages/CategoryPage";
import OrderConfirmation from "./pages/OrderConfirmation";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/new-arrivals" component={NewArrivals} /><Route path="/deals" component={Deals} /><Route path="/about" component={About} /><Route path="/contact" component={Contact} /><Route path="/favorites" component={Favorites} /><Route path="/login" component={Login} /><Route path="/account" component={Account} /><Route path="/product/:slug" component={ProductPage} /><Route path="/category/:slug" component={CategoryPage} /><Route path="/order-confirmation/:orderId" component={OrderConfirmation} /><Route path="/privacy-policy" component={PrivacyPolicy} /><Route path="/terms-and-conditions" component={TermsAndConditions} /><Route path="/refund-policy" component={RefundPolicy} /><Route path="/license" component={LicensePolicy} /><Route path="/faq" component={FAQ} /><Route path="/support" component={Support} /><Route path="/bundles" component={Bundles} /><Route path="/best-sellers" component={BestSellers} /><Route path="/free-resources" component={FreeResources} /><Route path="/categories" component={Categories} /><Route path="/admin" component={AdminDashboard} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return <ErrorBoundary><FavoritesProvider><CartProvider><TooltipProvider><Toaster /><ScrollToTop /><SiteHeader /><Router /><SiteFooter /><CartDrawer /></TooltipProvider></CartProvider></FavoritesProvider></ErrorBoundary>;
}
