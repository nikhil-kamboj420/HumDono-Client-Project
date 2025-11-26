import { useMemo, useState, useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import api from "../lib/api";
import SwipeDeck from "../components/SwipeDeck";
import SwipeCard from "../components/SwipeCard";
import MatchModal from "../components/MatchModal";
import Navigation from "../components/Navigation";
import CustomAlert from "../components/CustomAlert";
import LocationSearch from "../components/LocationSearch";
import { useCustomAlert } from "../hooks/useCustomAlert";

export default function HomeFeed() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [matchModal, setMatchModal] = useState({
    open: false,
    matchId: null,
    user: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 60,
    relationshipStatus: "any",
    gender: "any",
    verifiedOnly: false,
    hasPhotos: true,
    city: "",
    distance: 50, // km radius
    education: "",
    profession: "",
    drinking: "any",
    smoking: "any",
    eating: "any"
  });
  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } = useCustomAlert();

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getUserProfile();
        setCurrentUser(response.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const feedQuery = useInfiniteQuery({
      queryKey: ["feed", filters],
      queryFn: async ({ pageParam = 0 }) => {
        const limit = 8;
        const params = {
          limit,
          skip: pageParam * limit,
          ...filters,
        };
        // Use the existing getFeed method which handles the API call properly
        const res = await api.getFeed(params);
        return {
          items: res.results || [],
          nextPage: pageParam + 1,
          length: res.results?.length ?? 0,
        };
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length === 0 || lastPage.length < 8)
          return undefined;
        return lastPage.nextPage;
      },
      staleTime: 1000 * 30,
      retry: false,
    });

    const {
      data,
      isLoading,
      isError,
      isFetching,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    } = feedQuery;
    const cards = useMemo(
      () => (data?.pages ? data.pages.flatMap((p) => p.items) : []),
      [data]
    );

    const interactionMutation = useMutation({
      mutationFn: ({ to, action }) => api.postInteraction({ to, action }),
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: ["feed"] });
        if (res?.match) {
          // open match modal with returned matched user & matchId (server provided)
          setMatchModal({ open: true, matchId: res.matchId, user: res.user });
        }
      },
      onError: (err) => {
        console.error("Interaction failed:", err);
        showError(err?.response?.data?.error || "Action failed", "Interaction Failed");
      },
    });

    const handleAction = (toId, action) => {
      if (!toId) return;
      interactionMutation.mutate({ to: toId, action });
    };

    const friendRequestMutation = useMutation({
      mutationFn: (recipientId) => api.sendFriendRequest(recipientId),
      onSuccess: () => {
        showSuccess("Friend request sent successfully! 🎉", "Request Sent");
      },
      onError: (err) => {
        console.error("Friend request failed:", err);
        showError(err?.response?.data?.error || "Failed to send friend request", "Request Failed");
      },
    });

    const handleSendFriendRequest = async (recipientId) => {
      if (!recipientId) return;

      try {
        // Check if request was previously sent and rejected
        const sentRequests = await api.getSentFriendRequests();
        const existingRequest = sentRequests.sentRequests?.find(
          req => req.recipient._id === recipientId
        );

        if (existingRequest && existingRequest.status === 'rejected') {
          // Allow re-sending if previously rejected
          showConfirm(
            "Your previous friend request was declined. Do you want to send another request?",
            () => friendRequestMutation.mutate(recipientId),
            "Resend Friend Request?"
          );
          return;
        }

        friendRequestMutation.mutate(recipientId);
      } catch (error) {
        console.error("Error checking friend request status:", error);
        // If error checking, just send the request
        friendRequestMutation.mutate(recipientId);
      }
    };

  // Handle direct message
  const handleDirectMessage = async (profile) => {
    const isFemale = currentUser?.gender?.toLowerCase() === 'female';
    const hasLifetimeSubscription = currentUser?.subscription?.isLifetime === true;

    // Female users can always send messages
    if (isFemale) {
      sessionStorage.setItem('directMessageUser', JSON.stringify({
        _id: profile._id,
        name: profile.name,
        photos: profile.photos,
        age: profile.age
      }));
      navigate('/messages');
      return;
    }

    // Male users WITH lifetime subscription can send messages
    if (hasLifetimeSubscription) {
      sessionStorage.setItem('directMessageUser', JSON.stringify({
        _id: profile._id,
        name: profile.name,
        photos: profile.photos,
        age: profile.age
      }));
      navigate('/messages');
      return;
    }

    // Male users WITHOUT subscription - redirect to subscription page
    navigate('/subscription?required=true');
  };

  const handleNotificationAction = async (action, notification) => {
    try {
      switch (action) {
        case "view_profile":
          // Navigate to user profile or show in modal
          console.log("View profile:", notification.fromUser);
          break;

        case "like_back":
          if (notification.fromUser?._id) {
            await api.postInteraction({
              to: notification.fromUser._id,
              action: "like"
            });
            qc.invalidateQueries({ queryKey: ["feed"] });
          }
          break;

        case "accept_friend":
          if (notification.data?.requestId) {
            await api.respondToFriendRequest(notification.data.requestId, "accept");
            qc.invalidateQueries({ queryKey: ["friend-requests"] });
          }
          break;

        case "send_message":
          if (notification.data?.matchId) {
            navigate(`/chat/${notification.data.matchId}`);
          }
          break;

        default:
          navigate("/notifications");
      }

      // Mark notification as read
      if (notification._id) {
        await api.markNotificationRead(notification._id);
      }
    } catch (error) {
      console.error("Notification action failed:", error);
    }
  };

  const handleRequestPhoneAccess = async (userId) => {
    try {
      const response = await api.requestPhoneAccess(userId);
      if (response.ok) {
        showSuccess(response.message || "Phone access request sent successfully! 📞", "Request Sent");
      }
    } catch (error) {
      console.error("Phone access request failed:", error);
      showError("Failed to send phone access request. Please try again.", "Request Failed");
    }
  };

  // Only show full loading screen on very first load (no data at all)
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto romantic-pulse"></div>
          <p className="mt-4 text-white font-semibold">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Failed to load feed. Refresh the page.</div>
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-sunset-gradient pb-0 lg:pb-0 lg:pr-64 overflow-x-hidden w-full">
            <div className="mx-auto max-w-sm lg:max-w-md xl:max-w-lg p-4 w-full container-fix">
              <header className="flex items-center justify-between  max-h-[10vh]  relative top-3 mb-3.5  gap-2 ">
                <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0 overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="HumDono Logo"
                    className="h-20 w-20 lg:h-30 lg:w-30 object-contain cursor-pointer drop-shadow-lg"
                    onClick={() => navigate("/")}
                  />
                  <h2 className="lg:text-2xl xl:text-3xl font-extrabold text-white truncate shadow-lg">
                    💕 Discover Love
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative right-10 lg:right-40 flex items-center space-x-2 text-white/80 hover:text-white transition-colors shrink-0"
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5 lg:w-6 lg:h-6 " />
                  <span className="text-sm lg:text-base hidden sm:inline ">
                    Filters
                  </span>
                </button>
              </header>

              {/* Filters Panel - responsive */}
              {showFilters && (
                <div className="card-romantic p-4 lg:p-6 mb-4 lg:mb-6 w-full overflow-hidden">
                  <h3 className="font-semibold text-lg lg:text-xl mb-4 lg:mb-6 text-passion">
                    💖 Find Your Perfect Match
                  </h3>

                  <div className="space-y-4 lg:space-y-6">
                    {/* Age Range - responsive */}
                    <div>
                      <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                        Age Range: {filters.minAge} - {filters.maxAge}
                      </label>
                      <div className="flex space-x-4 lg:space-x-6">
                        <input
                          type="range"
                          min="18"
                          max="80"
                          value={filters.minAge}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              minAge: parseInt(e.target.value),
                            }))
                          }
                          className="flex-1 h-2 lg:h-3"
                        />
                        <input
                          type="range"
                          min="18"
                          max="80"
                          value={filters.maxAge}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxAge: parseInt(e.target.value),
                            }))
                          }
                          className="flex-1 h-2 lg:h-3"
                        />
                      </div>
                    </div>

                    {/* Relationship Status & Gender - responsive grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Relationship Status
                        </label>
                        <select
                          value={filters.relationshipStatus}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              relationshipStatus: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <option value="any">Any</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                          <option value="complicated">It's Complicated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={filters.gender}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <option value="any">Any</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Location & Professional Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <LocationSearch
                          value={filters.city}
                          onChange={(location) =>
                            setFilters((prev) => ({
                              ...prev,
                              city: location,
                            }))
                          }
                          placeholder="Search city or use current location"
                        />
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                          Distance: {filters.distance} km
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="200"
                          step="5"
                          value={filters.distance}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              distance: parseInt(e.target.value),
                            }))
                          }
                          className="w-full h-2 lg:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>5 km</span>
                          <span>200 km</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Education
                        </label>
                        <input
                          type="text"
                          value={filters.education}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              education: e.target.value,
                            }))
                          }
                          placeholder="e.g. Engineering"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base"
                        />
                      </div>
                    </div>

                    {/* Lifestyle Preferences */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Drinking
                        </label>
                        <select
                          value={filters.drinking}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              drinking: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <option value="any">Any</option>
                          <option value="never">Never</option>
                          <option value="socially">Socially</option>
                          <option value="regularly">Regularly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Smoking
                        </label>
                        <select
                          value={filters.smoking}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              smoking: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <option value="any">Any</option>
                          <option value="never">Never</option>
                          <option value="socially">Socially</option>
                          <option value="regularly">Regularly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                          Diet
                        </label>
                        <select
                          value={filters.eating}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              eating: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <option value="any">Any</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="non-vegetarian">Non-Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="jain">Jain</option>
                        </select>
                      </div>
                    </div>

                    {/* Checkboxes - responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              verifiedOnly: e.target.checked,
                            }))
                          }
                          className="mr-2 lg:mr-3 w-4 h-4 lg:w-5 lg:h-5"
                        />
                        <span className="text-sm lg:text-base">
                          Verified users only
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.hasPhotos}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              hasPhotos: e.target.checked,
                            }))
                          }
                          className="mr-2 lg:mr-3 w-4 h-4 lg:w-5 lg:h-5"
                        />
                        <span className="text-sm lg:text-base">
                          Users with photos only
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setFilters({
                          minAge: 18,
                          maxAge: 60,
                          relationshipStatus: "any",
                          gender: "any",
                          verifiedOnly: false,
                          hasPhotos: true,
                          city: "",
                          distance: 50,
                          education: "",
                          profession: "",
                          drinking: "any",
                          smoking: "any",
                          eating: "any"
                        });
                      }}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              <div className="relative z-40 h-[calc(100vh-120px)] lg:h-[80vh] w-full overflow-hidden">
                <SwipeDeck>
                  {cards.map((c) => (
                    <SwipeCard
                      key={c._id}
                      profile={c}
                      onLike={() => handleAction(c._id, "like")}
                      onDislike={() => handleAction(c._id, "dislike")}
                      onRequestPhone={() => handleRequestPhoneAccess(c._id)}
                      onSendFriendRequest={() => handleSendFriendRequest(c._id)}
                      onMessage={() => handleDirectMessage(c)}
                    />
                  ))}
                </SwipeDeck>
              </div>

              <div className="mt-4 lg:mt-6 flex justify-center gap-4">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage || !hasNextPage}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-white border rounded shadow text-sm lg:text-base hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage
                    ? "Loading…"
                    : hasNextPage
                      ? "Load more"
                      : "No more"}
                </button>
              </div>
            </div>

            <MatchModal
              open={matchModal.open}
              matchId={matchModal.matchId}
              matchedUser={matchModal.user}
              onClose={() =>
                setMatchModal({ open: false, matchId: null, user: null })
              }
            />

            <Navigation />

            {/* Custom Alert */}
            <CustomAlert
              isOpen={alertConfig.isOpen}
              onClose={hideAlert}
              title={alertConfig.title}
              message={alertConfig.message}
              type={alertConfig.type}
              confirmText={alertConfig.confirmText}
              cancelText={alertConfig.cancelText}
              showCancel={alertConfig.showCancel}
              onConfirm={alertConfig.onConfirm}
              onCancel={alertConfig.onCancel}
            />
          </div>
        );
      }
