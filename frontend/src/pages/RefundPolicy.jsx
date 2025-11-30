// frontend/src/pages/RefundPolicy.jsx
import { CreditCard, XCircle, CheckCircle, Mail, Phone, AlertTriangle } from "lucide-react";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Refund &amp; Cancellation Policy
                    </h1>
                    <p className="text-gray-600 text-lg">
                        This Refund &amp; Cancellation Policy applies to all subscription purchases made on the HumDono Platform.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* Digital Service */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-8 h-8 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Digital Service</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            HumDono provides only digital services in the form of premium features on the Platform.
                            No physical products are shipped.
                        </p>
                    </section>

                    {/* General Rule - No Refund */}
                    <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-800">General Rule – No Refund for Activated Subscriptions</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Once a subscription is successfully activated on your HumDono account and the premium features
                            are available for use, the payment is considered final and <strong className="text-red-600">non-refundable</strong>.
                        </p>
                    </section>

                    {/* When Refunds Are Considered */}
                    <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <h2 className="text-2xl font-bold text-gray-800">When Refunds Are Considered</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            A refund may be considered only in the following case:
                        </p>
                        <div className="bg-white rounded-xl p-6 border-l-4 border-green-500">
                            <p className="text-gray-700 leading-relaxed">
                                The amount was successfully debited from your bank/UPI/card, but the subscription was{" "}
                                <strong className="text-green-600">not activated</strong> on HumDono.
                            </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            In such cases, you must contact us within <strong className="text-green-600">24 hours</strong> of
                            the payment with valid proof (payment ID, screenshot of bank/UPI statement, etc.).
                        </p>
                    </section>

                    {/* How to Raise a Refund Request */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-8 h-8 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">How to Raise a Refund Request</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            To request a refund in the above situation, email us at{" "}
                            <a href="mailto:humdonodating@gmail.com" className="text-pink-600 hover:underline font-medium">
                                humdonodating@gmail.com
                            </a>{" "}
                            with:
                        </p>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">✓</span>
                                <span>Your full name and registered mobile/email on HumDono</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">✓</span>
                                <span>Payment date and amount</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">✓</span>
                                <span>Payment reference ID/transaction ID</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">✓</span>
                                <span>Screenshot of the payment debit</span>
                            </li>
                        </ul>

                        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <p className="text-gray-700 leading-relaxed mb-3">
                                After verifying the details with our payment gateway, if we confirm that the payment was
                                debited but the subscription was not activated, we will either:
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>Manually activate your subscription, or</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>Initiate a refund back to the original payment method.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Cancellations */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Cancellations</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            There is no mid-term cancellation or partial refund for active subscriptions. You can stop
                            using the service at any time, but no refund will be provided for the remaining period of
                            the current subscription.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-8 h-8 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Contact</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            For any questions about this Refund &amp; Cancellation Policy, you can contact us at:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-pink-600" />
                                <a
                                    href="mailto:humdonodating@gmail.com"
                                    className="text-pink-600 hover:text-pink-700 font-medium hover:underline"
                                >
                                    humdonodating@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-purple-600" />
                                <a
                                    href="tel:+918168072911"
                                    className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                                >
                                    +91 81680 72911
                                </a>
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
                    <a
                        href="/"
                        className="inline-block mt-4 text-pink-600 hover:text-pink-700 font-medium text-lg hover:underline"
                    >
                        ← Back to HumDono
                    </a>
                </div>
            </div>
        </div>
    );
}
