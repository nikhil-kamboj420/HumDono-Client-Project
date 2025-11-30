import { Package, Truck } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">Shipping Policy</h1>
          <p className="text-gray-600 text-lg">HumDono provides only digital services. No physical shipping is required.</p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-800">Digital Service</h2>
            </div>
            <p className="text-gray-700">Subscriptions unlock premium features within the app. No physical products are shipped.</p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Delivery</h2>
            </div>
            <p className="text-gray-700">Access to premium features is provided instantly upon successful payment and activation.</p>
          </section>
        </div>

        <div className="text-center mt-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a href="/contact" className="text-pink-600 hover:underline">Contact</a>
            <a href="/terms" className="text-pink-600 hover:underline">Terms</a>
            <a href="/refund-policy" className="text-pink-600 hover:underline">Refund Policy</a>
            <a href="/privacy-policy" className="text-pink-600 hover:underline">Privacy Policy</a>
            <a href="/shipping-policy" className="text-pink-600 hover:underline">Shipping Policy</a>
            <a href="/checkout-policy" className="text-pink-600 hover:underline">Checkout Policy</a>
          </div>
          <a href="/" className="inline-block mt-4 text-pink-600 hover:text-pink-700 font-medium text-lg hover:underline">← Back to HumDono</a>
        </div>
      </div>
    </div>
  );
}
