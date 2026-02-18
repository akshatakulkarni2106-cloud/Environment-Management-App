import { Heart, MessageCircle, Share2, Plus, Home, Target, Trophy, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SocialFeed() {
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
        key: "rzp_test_SGtmofw4CWXzzG", // 👉 paste your Razorpay key here
        amount: order.amount,
        currency: "INR",
        name: "Prithvi Donation",
        description: "Support this campaign ❤️",
        order_id: order.id,
        handler: function () {
          alert("Payment Successful 🎉");
        },
        theme: { color: "#22c55e" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert("Payment Failed 😢");
      console.log(err);
    }
  };

  const posts = [
    {
      id: 1,
      user: {
        name: 'Sarah Green',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        time: '5h ago'
      },
      badge: 'TREE PLANTING',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
      caption: 'Just finished our weekend reforestation project! We managed to plant 500 native trees. Every small action counts!',
      hashtags: '#Reforestation #ClimateAction #Nature',
      likes: 124,
      comments: 38,
      supported: true
    },
    {
      id: 2,
      user: {
        name: 'Marcus River',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        time: '5h ago'
      },
      badge: 'BEACH CLEANUP',
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&h=600&fit=crop',
      caption: 'Morning cleanup at Pebble Beach. It is heartbreaking to see so much plastic, but together we can make a difference!',
      hashtags: '#BeachCleanup #PlasticFree #OceanWarriors',
      likes: 89,
      comments: 12,
      supported: true
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">

      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white rounded-lg"></div>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button className="flex-1 py-3 text-green-600 border-b-2 border-green-600 font-semibold">
            For You
          </button>
          <button className="flex-1 py-3 text-gray-500">
            Following
          </button>
        </div>
      </div>

      <div className="pb-20">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-200 pb-4">

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm">{post.user.name}</div>
                  <div className="text-xs text-gray-500">{post.user.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium">{post.badge}</span>
              </div>
            </div>

            <img src={post.image} alt="Post" className="w-full h-64 object-cover" />

            <div className="px-4 pt-3">
              {post.supported && (
                <button className="bg-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-3 flex items-center gap-1">
                  $ Supported: $200
                </button>
              )}

              <p className="text-sm mb-2">{post.caption}</p>
              <p className="text-xs text-green-600 mb-3">{post.hashtags}</p>

              <div className="flex items-center gap-4 text-gray-600">
                <button className="flex items-center gap-1">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="ml-auto">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* ⭐ DONATE BUTTON (UI unchanged) */}
              <button
                onClick={payNow}
                className="w-full bg-blue-500 text-white py-2 rounded-xl mt-3"
              >
                Donate ₹100 ❤️
              </button>

            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
        <div className="flex items-center justify-around py-3">
          <button className="flex flex-col items-center gap-1 text-green-600">
            <Home className="w-6 h-6" fill="currentColor" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => navigate("/acc/home/campaign")} className="flex flex-col items-center gap-1 text-gray-500">
            <Target className="w-6 h-6" />
            <span className="text-xs">Campaign</span>
          </button>
          <button onClick={() => navigate("/acc/home/post")} className="flex flex-col items-center gap-1 text-gray-500">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
          </button>
          <button onClick={() => navigate("/acc/home/leaderboard")} className="flex flex-col items-center gap-1 text-gray-500">
            <Trophy className="w-6 h-6" />
            <span className="text-xs">Leaderboard</span>
          </button>
          <button onClick={() => navigate("/acc/home/profile")} className="flex flex-col items-center gap-1 text-gray-500">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
