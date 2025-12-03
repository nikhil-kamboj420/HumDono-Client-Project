import { useMemo, useState, useEffect, useRef } from "react";
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
import { useLocation } from "react-router-dom";
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
  const [prevOpen, setPrevOpen] = useState(false);

  // --- CORE STATE ---
  // profiles: The active queue of cards. We always show profiles[0].
  const [profiles, setProfiles] = useState([]);

  // seenIds: History of all profiles swiped in this session (or persisted).
  const [seenIds, setSeenIds] = useState(() => new Set());

  // actionLock: Ref to prevent double-clicks/rapid-fire actions within same render cycle
  const actionLock = useRef(false);

  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 60,
    relationshipStatus: "any",
  });
  const [draftFilters, setDraftFilters] = useState({ ...filters });

  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } =
    useCustomAlert();

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
      const limit = 30;
      const params = {
        limit,
        skip: pageParam * limit,
        ...filters,
      };
      const res = await api.getFeed(params);
      return {
        items: res.results || [],
        nextPage: pageParam + 1,
        length: res.results?.length ?? 0,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage && lastPage.items && lastPage.items.length > 0
        ? lastPage.nextPage
        : undefined;
    },
    staleTime: 1000 * 30,
    retry: false,
    keepPreviousData: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage , isFetching} =
    feedQuery;

  
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      feedQuery.refetch();
      setProfiles([]);
      setSeenIds(new Set());
    }
  }, [location.pathname]);

  // Flatten all pages into one list
  const rawItems = useMemo(
    () => (data?.pages ? data.pages.flatMap((p) => p.items) : []),
    [data]
  );

  // --- QUEUE SYNC LOGIC ---
  // When rawItems updates (new page fetched), append ONLY new, unseen items to profiles.
  useEffect(() => {
    if (!rawItems || rawItems.length === 0) return;

    setProfiles((prevProfiles) => {
      // Create a set of IDs currently in the queue to avoid duplicates
      const currentQueueIds = new Set(prevProfiles.map((p) => p._id));

      // Filter rawItems:
      // 1. Must have an ID
      // 2. Must NOT be in seenIds (already swiped)
      // 3. Must NOT be in current queue (already added)
      const newCandidates = rawItems.filter(
        (item) =>
          item?._id && !seenIds.has(item._id) && !currentQueueIds.has(item._id)
      );

      if (newCandidates.length === 0) return prevProfiles;

      // Append new candidates to the end of the queue
      return [...prevProfiles, ...newCandidates];
    });
  }, [rawItems, seenIds]); // Re-run if rawItems changes or if we need to re-validate against seenIds

  const interactionMutation = useMutation({
    mutationFn: ({ to, action }) => api.postInteraction({ to, action }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      if (res?.match) {
        setMatchModal({ open: true, matchId: res.matchId, user: res.user });
      }
    },
    onError: (err) => {
      console.error("Interaction failed:", err);
      // Optional: Undo the swipe if API fails? Usually better to just show error and move on.
    },
  });

  // --- ACTION HANDLER ---
  const handleAction = (type) => {
    // 1. Check Lock
    if (actionLock.current) return;

    // 2. Get current profile (always index 0)
    const current = profiles[0];
    if (!current || !current._id) return;

    // 3. Set Lock
    actionLock.current = true;

    const serverAction = type === "skip" ? "dislike" : type;
    console.log(`🎯 Action: ${serverAction} on user: ${current._id}`);

    // 4. Optimistic Update: Remove from queue immediately & Add to seenIds
    setProfiles((prev) => prev.slice(1)); // Remove head

    setSeenIds((prev) => {
      const next = new Set(prev);
      next.add(current._id);
      return next;
    });

    // 5. Fire API call
    interactionMutation.mutate({ to: current._id, action: serverAction });

    // 6. Check if we need more profiles
    // Fetch next page ONLY if needed
    if (hasNextPage && profiles.length <= 4 && !isFetchingNextPage) {
      fetchNextPage();
    }

    // 7. Release Lock after delay (prevents double-tap)
    setTimeout(() => {
      actionLock.current = false;
    }, 300);
  };

  const friendRequestMutation = useMutation({
    mutationFn: (recipientId) => api.sendFriendRequest(recipientId),
    onSuccess: () => {
      showSuccess("Friend request sent successfully! 🎉", "Request Sent");
    },
    onError: (err) => {
      console.error("Friend request failed:", err);
      showError(
        err?.response?.data?.error || "Failed to send friend request",
        "Request Failed"
      );
    },
  });

  const handleSendFriendRequest = async (recipientId) => {
    if (!recipientId) return;

    try {
      // Check if request was previously sent and rejected
      const sentRequests = await api.getSentFriendRequests();
      const existingRequest = sentRequests.sentRequests?.find(
        (req) => req.recipient._id === recipientId
      );

      if (existingRequest && existingRequest.status === "rejected") {
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
    const isFemale = currentUser?.gender?.toLowerCase() === "female";
    const hasLifetimeSubscription =
      currentUser?.subscription?.isLifetime === true;

    // Female users can always send messages
    if (isFemale) {
      sessionStorage.setItem(
        "directMessageUser",
        JSON.stringify({
          _id: profile._id,
          name: profile.name,
          photos: profile.photos,
          age: profile.age,
        })
      );
      navigate("/messages");
      return;
    }

    // Male users WITH lifetime subscription can send messages
    if (hasLifetimeSubscription) {
      sessionStorage.setItem(
        "directMessageUser",
        JSON.stringify({
          _id: profile._id,
          name: profile.name,
          photos: profile.photos,
          age: profile.age,
        })
      );
      navigate("/messages");
      return;
    }

    // Male users WITHOUT subscription - redirect to subscription page
    navigate("/subscription?required=true");
  };

  const handleRequestPhoneAccess = async (userId) => {
    try {
      const response = await api.requestPhoneAccess(userId);
      if (response.ok) {
        showSuccess(
          response.message || "Phone access request sent successfully! 📞",
          "Request Sent"
        );
      }
    } catch (error) {
      console.error("Phone access request failed:", error);
      showError(
        "Failed to send phone access request. Please try again.",
        "Request Failed"
      );
    }
  };

  const hasAnyItems = !!data?.pages?.some((p) => (p.items?.length ?? 0) > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto romantic-pulse"></div>
          <p className="mt-4 text-white font-semibold">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-0 lg:pb-0 lg:pr-64 overflow-x-hidden w-full">
      <div className="mx-auto max-w-sm lg:max-w-md xl:max-w-lg p-4 w-full container-fix">
        <header className="flex items-center justify-between max-h-[10vh] relative top-3 mb-3.5 gap-2">
          <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="mb-3 h-20 w-20 lg:h-30 lg:w-30 object-contain cursor-pointer drop-shadow-lg"
              onClick={() => navigate("/")}
            />
            <h2 className="text-xl lg:text-2xl xl:text-3xl font-extrabold text-white truncate shadow-lg">
              💕 Discover Love
            </h2>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors shrink-0"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="text-sm lg:text-base hidden sm:inline">
              Filters
            </span>
          </button>
        </header>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card-romantic p-4 lg:p-6 mb-4 lg:mb-6 w-full overflow-hidden">
            <h3 className="font-semibold text-lg lg:text-xl mb-4 lg:mb-6 text-passion">
              💖 Find Your Perfect Match
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range: {draftFilters.minAge} - {draftFilters.maxAge}
                </label>
                <div className="flex space-x-4">
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={draftFilters.minAge}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        minAge: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={draftFilters.maxAge}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        maxAge: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Status
                </label>
                <select
                  value={draftFilters.relationshipStatus}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      relationshipStatus: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="any">Any</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setFilters(draftFilters);
                  setShowFilters(false);
                  setProfiles([]); // Clear profiles to force refresh with new filters
                }}
                className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="relative z-40 h-[calc(100vh-120px)] lg:h-[80vh] w-full overflow-hidden">
          <SwipeDeck>
            {/* Show profiles if available */}
            {profiles.length > 0 && hasAnyItems && (
              <SwipeCard
                key={profiles[0]._id}
                profile={profiles[0]}
                currentUser={currentUser}
                disabled={false}
                onLike={() => handleAction("like")}
                onSkip={() => handleAction("skip")}
                onDislike={() => handleAction("dislike")}
                onMessage={handleDirectMessage}
                onRequestPhone={handleRequestPhoneAccess}
                onSendFriendRequest={handleSendFriendRequest}
              />
            )}

            {/* Show "No More Profiles" message centered in the card area */}
            {!hasNextPage &&(
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center py-8 px-4">
                  <div className="text-6xl lg:text-7xl mb-4">💕</div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                    More profiles coming soon..
                  </h3>
                  <button
                    onClick={() => setPrevOpen((v) => !v)}
                    className="px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors mb-4"
                  >
                    Previous interactions
                  </button>
                  {prevOpen && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => navigate("/likes")}
                        className="px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
                      >
                        People I Liked
                      </button>
                      <button
                        onClick={() => navigate("/dislikes")}
                        className="px-6 py-3 bg-white/10 text-white border border-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                      >
                        People I Disliked
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show "Load more" button if there are more pages but no profiles in queue */}
            {profiles.length === 0 && hasNextPage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 bg-white border rounded-lg shadow text-base hover:bg-gray-50 transition-colors disabled:opacity-50 font-semibold"
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </SwipeDeck>
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
