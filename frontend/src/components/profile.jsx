import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Plus, Home, Target, Trophy, ArrowLeft, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchUserPosts();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/user', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                // ⭐ FAKE BADGE FOR TESTING
                setUserData({
                    ...data.user,
                    badge: "gold",      // change to silver / blue
                    verified: true
                });
            } else {
                navigate('/acc');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            navigate('/acc');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            navigate('/acc');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await fetch('http://localhost:3000/post/myposts', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setUserPosts(data.posts);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!userData) return null;

    const stats = [
        { label: 'Posts', value: userPosts.length.toString() },
        { label: 'Followers', value: userData.followers || '0' },
        { label: 'Following', value: userData.Following || '0' }
    ];

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen">

            {/* TOP BAR */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate("/acc/home")}>
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-semibold">My Profile</h1>
                    <button onClick={handleLogout} className="flex items-center gap-1 text-red-500">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* COVER */}
            <div className="relative">
                <div className="h-32 bg-gradient-to-br from-green-400 to-green-600" />

                {/* PROFILE IMAGE WITH BORDER */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
                    <img
                        src={userData.avatar || 'https://via.placeholder.com/200'}
                        alt="Profile"
                        className={`w-24 h-24 rounded-full border-4 object-cover
                        ${userData.badge === "gold" ? "border-yellow-400" :
                        userData.badge === "silver" ? "border-gray-400" :
                        userData.badge === "blue" ? "border-blue-500" :
                        "border-white"}`}
                    />
                </div>
            </div>

            {/* NAME + VERIFIED */}
            <div className="pt-14 px-4 text-center">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    {userData.name}
                    {userData.verified && (
                        <span className="text-blue-500 text-lg">✔</span>
                    )}
                </h2>

                <p className="text-sm text-green-600 mb-2">@{userData.username}</p>
                <p className="text-sm text-gray-600 mb-4">{userData.email}</p>

                <button
                    onClick={() => navigate("/newacc")}
                    className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50"
                >
                    Edit Profile
                </button>
            </div>

            {/* STATS */}
            <div className="flex items-center justify-around py-4 px-4 mt-4 border-y border-gray-200">
                {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* POSTS */}
            <div className="grid grid-cols-3 gap-1 px-1 pb-20 mt-2">
                {userPosts.length > 0 ? (
                    userPosts.map((post, index) => (
                        <div key={index} className="aspect-square bg-gray-200">
                            {post.image && (
                                <img src={post.image} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                        No posts yet
                    </div>
                )}
            </div>
        </div>
    );
}