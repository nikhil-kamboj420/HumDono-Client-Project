// frontend/src/pages/Terms.jsx
import { Shield, Users, CreditCard, AlertCircle, Scale, Mail } from "lucide-react";

export default function Terms() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Terms and Conditions
                    </h1>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        By accessing or using the HumDono website ("Platform"), you agree to be bound by these
                        Terms and Conditions ("Terms") in a legally binding agreement between you ("User", "you", "your")
                        and HumDono ("we", "us", "our"). If you do not agree to these Terms, you must not use the Platform.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* Eligibility */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-8 h-8 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Eligibility</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            You must be at least 18 years old to use HumDono. By using the Platform, you represent
                            that you are 18+ and legally capable of entering into a binding contract.
                        </p>
                    </section>

                    {/* Nature of Service */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-8 h-8 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Nature of Service</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            HumDono is an online social networking and matchmaking platform that allows users to create
                            profiles, discover other users and connect with them. Paid subscriptions provide additional
                            features like profile boost, better visibility, and advanced filters. No physical products are sold.
                        </p>
                    </section>

                    {/* Prohibited Content */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Prohibited Content and Activities</h2>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>No adult, pornographic, escort or prostitution-related services.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>No nudity, sexually explicit, abusive, hateful or illegal content.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>No harassment, bullying, threats, or hate speech against any person or group.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>No impersonation, fake profiles or misuse of someone else's identity.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>No attempts to hack, damage or disrupt the Platform.</span>
                            </li>
                        </ul>
                        <p className="text-gray-700 mt-4 font-medium">
                            If we find that you are violating these rules, we may suspend or terminate your account
                            without any refund.
                        </p>
                    </section>

                    {/* User Responsibilities */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-8 h-8 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">User Responsibilities</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            You agree to provide true, accurate and up-to-date information about yourself. You are
                            responsible for all activity that happens using your account. You must keep your login
                            details safe and not share them with others.
                        </p>
                    </section>

                    {/* Payments */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-8 h-8 text-green-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Payments and Subscriptions</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            All payments for subscriptions on HumDono must be made through legitimate payment methods.
                            The prices shown on the Platform are inclusive of applicable taxes, if any. Subscription
                            features and prices may change from time to time, and such changes will apply from the next
                            billing cycle.
                        </p>
                    </section>

                    {/* Refunds */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-yellow-100">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-8 h-8 text-yellow-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Refunds</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Refunds are only considered if the payment was successfully debited from your account but
                            the subscription was not activated on HumDono. In such cases, you must contact us at{" "}
                            <strong>humdonodating@gmail.com</strong> with payment proof within 24 hours. Our detailed
                            Refund & Cancellation Policy is available on the{" "}
                            <a href="/refund-policy" className="text-pink-600 hover:underline font-medium">
                                Refund Policy page
                            </a>.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-8 h-8 text-orange-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Limitation of Liability</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            HumDono is a platform where users interact with each other. We are not responsible for the
                            behaviour, actions or statements of any user on or off the Platform. You are solely responsible
                            for your interactions and agree to use the Platform at your own risk.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-8 h-8 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Changes to These Terms</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            We may update these Terms from time to time. The latest version will always be available on
                            this page. Continuing to use the Platform after changes means you accept the updated Terms.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-8 h-8 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Contact</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            For any questions about these Terms, you can contact us at{" "}
                            <a href="mailto:humdonodating@gmail.com" className="text-pink-600 hover:underline font-medium">
                                humdonodating@gmail.com
                            </a>.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-8 h-8 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Governing Law</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms are governed by the laws of India and any disputes shall be subject to the
                            exclusive jurisdiction of courts in India.
                        </p>
                    </section>
                </div>

                {/* Back to Home Link */}
                <div className="text-center mt-8">
                    <a
                        href="/"
                        className="inline-block text-pink-600 hover:text-pink-700 font-medium text-lg hover:underline"
                    >
                        ← Back to HumDono
                    </a>
                </div>
            </div>
        </div>
    );
}
