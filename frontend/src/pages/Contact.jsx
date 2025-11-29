// frontend/src/pages/Contact.jsx
import { Mail, Phone, Building2 } from "lucide-react";

export default function Contact() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Contact Us
                    </h1>
                    <p className="text-gray-600 text-lg">
                        If you have any questions about your account, subscription or payments on HumDono,
                        you can reach us using the details below.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Email Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Email</h2>
                        </div>
                        <a
                            href="mailto:humdonodating@gmail.com"
                            className="text-pink-600 hover:text-pink-700 text-lg font-medium break-all"
                        >
                            humdonodating@gmail.com
                        </a>
                    </div>

                    {/* Phone Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Phone</h2>
                        </div>
                        <a
                            href="tel:+918168072911"
                            className="text-purple-600 hover:text-purple-700 text-lg font-medium"
                        >
                            +91 81680 72911
                        </a>
                    </div>
                </div>

                {/* Business Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Business Name</h2>
                    </div>
                    <p className="text-gray-700 text-lg">
                        HumDono – Online social networking and matchmaking platform.
                    </p>
                </div>

                {/* Response Time Notice */}
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 text-center">
                    <p className="text-gray-700 text-lg font-medium">
                        ⏱️ We usually respond within 24–48 working hours.
                    </p>
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
