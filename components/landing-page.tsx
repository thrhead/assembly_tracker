"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import Link from "next/link";

const socket = io("http://localhost:3001");

export function LandingPage() {
    useEffect(() => {
        socket.on("receiveNotification", (data) => {
            console.log("Yeni bildirim:", data);
            // Burada bildirimleri kullanıcıya göstermek için gerekli işlemleri yapabilirsiniz.
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const sendNotification = () => {
        socket.emit("sendNotification", { message: "Yeni bir bildirim!" });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="text-center max-w-4xl mx-auto px-4">
                <h1 className="text-6xl font-bold text-gray-900 mb-6">
                    Montaj ve Servis <span className="text-indigo-600">Takip Sistemi</span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Fabrika dışında çalışan montaj ve servis ekiplerinin işlerini kolayca takip edin.
                    Maliyet kontrolü, ekip yönetimi ve müşteri bildirimleri tek platformda.
                </p>

                <div className="space-x-4">
                    <Link
                        href="/login"
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
                    >
                        Giriş Yap
                    </Link>
                    <button
                        onClick={sendNotification}
                        className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                        Bildirim Testi
                    </button>
                </div>
            </div>
        </div>
    );
}
