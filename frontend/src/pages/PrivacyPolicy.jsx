import { Shield, Mail, Phone } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">At HumDono, we respect your privacy and are committed to protecting your personal information.</p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-800">Information We Collect</h2>
            </div>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Profile details</li>
              <li>Payment related information (processed securely by payment gateway)</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">How We Use Your Data</h2>
            <p className="text-gray-700 mb-2">Your data is used only for:</p>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Account creation and management</li>
              <li>Providing matchmaking and messaging features</li>
              <li>Improving platform quality</li>
              <li>Customer support</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Data Protection</h2>
            <p className="text-gray-700">We use standard security practices to protect your data from unauthorized access.</p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Third-party Services</h2>
            <p className="text-gray-700">Payments are processed securely by third-party gateways. We do not store your card or banking details.</p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-yellow-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">User Rights</h2>
            <p className="text-gray-700">You have the right to edit or delete your account at any time.</p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Updates</h2>
            <p className="text-gray-700">This policy may be updated without prior notice.</p>
          </section>

          <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact</h2>
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
