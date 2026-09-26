# HSR Digital Hub - UI/UX & App Flow

## 1. Design Aesthetics
- **Typography:** Primary headers utilize **Fraunces** for an elegant, editorial feel. Body text relies on **DM Sans** for maximum legibility.
- **Color Palette:** 
  - Backgrounds: Paper (`#fbf8f2`), Cream (`#f5efe5`)
  - Typography & Accents: Ink (`#172949`), Navy (`#0d2142`), Cobalt (`#1e57c8`), Brass (`#b68a3b`)
- **Visual Identity:** The site deliberately avoids a generic SaaS dashboard appearance, instead adopting a premium, content-first editorial presentation suited for high-value digital goods.

## 2. Core User Journeys

### 2.1. Discovery & Browsing
1. **Home Page:** Users land on a highly curated hero section. Scrolling reveals a trust strip, featured categories, and a 3-step "How it works" guide. Unnecessary repetitions of benefits are omitted for a concise, honest presentation.
2. **Shop/Catalog:** Users can filter products dynamically using URL query parameters (e.g., `?category=planners&sort=newest`). Empty states are handled gracefully with clear CTAs, ensuring users aren't presented with fake "Best Sellers" when categories are empty.
3. **Product Detail Page (PDP):** Users view real product galleries, "look inside" previews, and factual specs (format, size, license). A sticky "Buy Now" box remains accessible as the user scrolls.

### 2.2. Cart & Checkout (Guest & Authenticated)
1. **Cart Drawer:** Adding an item opens an accessible, focus-trapped side drawer. Digital goods are automatically de-duplicated (quantity locked to 1).
2. **Checkout Page:** A responsive, one-column layout on mobile (expanding to two on desktop). Users input Name, Email, and Mobile (plus optional GSTIN). 
3. **Payment:** The user selects Card or UPI. The Razorpay SDK modal handles the transaction.

### 2.3. Post-Purchase Fulfillment
1. **Order Confirmation:** Upon successful server-side payment verification, the user is redirected to a secure `/order-confirmation/:accessToken` route.
2. **Instant Download:** The confirmation page displays secure, tokenized download buttons.
3. **Email Delivery:** An HTML email containing the same secure download links is dispatched instantly.

### 2.4. Account Management
1. **Dashboard:** Users logging in are routed to `/account`, bypassing the login screen. The dashboard lists past orders, status, and PDF invoices.
2. **Wishlist:** Favorites saved via localStorage are seamlessly merged into the user's persistent database wishlist upon login.

### 2.5. Admin Operations
1. **Admin Portal:** Only accessible to users with the `admin` role. 
2. **Management:** Admins can toggle product active statuses, view real orders, manage reviews, and securely upload digital asset files to the cloud.

## 3. Responsive Constraints
- **Mobile First:** All interfaces, particularly the checkout form and FAQ headers, are strictly constrained to prevent horizontal overflow on devices as narrow as 320px.
- **Interactions:** Hover effects are subtle on desktop, translating to active states on touch devices. All tap targets adhere to a minimum 44px height.
