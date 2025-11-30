import { CreditCard, ShieldCheck, Mail, Phone } from "lucide-react";

export default function CheckoutPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">Checkout Policy</h1>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-8 h-8 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-800">Payment Processing</h2>
            </div>
            <p className="text-gray-700">All payments on HumDono are processed securely via verified payment gateways.</p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Accepted Payment Methods</h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>UPI</li>
              <li>Debit Card</li>
              <li>Credit Card</li>
              <li>Net Banking</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Transaction Security</h2>
            <p className="text-gray-700">We do not store any card or bank details.</p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Payment Failure</h2>
            <p className="text-gray-700">If payment fails but money is deducted, it will be refunded automatically within 5–7 working days.</p>
          </section>

          <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact</h2>
            <p className="text-gray-700 mb-3">For any payment issues:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-600" />
                <a href="mailto:humdonodating@gmail.com" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">humdonodating@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <a href="tel:+918168072911" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">+91 81680 72911</a>
              </div>
            </div>
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
