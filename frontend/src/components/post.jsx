import { ArrowLeft, Camera, MapPin, Hash, Users, Trees, Calendar, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [uploading, setUploading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(85);
  const navigate = useNavigate();

  // ⭐ Razorpay Payment Function
  const payNow = async () => {
    try {
      const res = await fetch("http://localhost:3000/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100 }),
      });

      const order = await res.json();

      const options = {
        key: "rzp_test_SGtmofw4CWXzzG", // 👉 paste your key here
        amount: order.amount,
        currency: "INR",
        name: "Prithvi Donation",
        description: "Test Donation",
        order_id: order.id,
        handler: function () {
          alert("Payment Successful 🎉 Thank you!");
        },
        theme: {
          color: "#22c55e"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Failed 😢");
      console.log(err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate("/acc/home")} className="text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">New Action</h1>
          <button className="text-green-600 font-semibold text-sm">
            Drafts
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* IMAGE UPLOAD */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-sm">Capture Your Impact</span>
          </div>

          <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center">
            Upload Image Here
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold mb-2">
            Tell the community what happened!
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
            rows="3"
            placeholder="Describe your action..."
          ></textarea>
        </div>

        {/* POST BUTTON */}
        <button className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-green-600">
          <CheckCircle className="w-5 h-5" />
          Post My Action
        </button>

        {/* ⭐ DONATE BUTTON */}
        <button
          onClick={payNow}
          className="w-full bg-blue-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:bg-blue-600"
        >
          Donate ₹100 ❤️
        </button>

      </div>
    </div>
  );
}
