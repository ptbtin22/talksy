import { MailPlus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import SearchUsersSkeleton from "./skeletons/SearchUsersSkeleton";

export default function NewMessageModal() {
  const [query, setQuery] = useState("");
  const { searchUsers, queriedUsers, isSearchingUsers, setSelectedUser } =
    useChatStore();
  const [pickedUser, setPickedUser] = useState(null);

  const pickUser = (user) => {
    if (user._id === pickedUser?._id) {
      setPickedUser(null);
      return;
    }
    setPickedUser(user);
  };

  const handleNext = () => {
    if (!pickedUser) return;
    setSelectedUser(pickedUser);
    setPickedUser(null);
    setQuery("");
    document.getElementById("new-message-modal").checked = false;
  };

  useEffect(() => {
    // Set isSearchingUsers true as soon as user starts typing
    useChatStore.getState().setIsSearchingUsers(true);
    const delay = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <>
      {/* Trigger */}
      <label
        htmlFor="new-message-modal"
        className="hidden lg:flex size-8 items-center justify-center rounded-full hover:bg-gray-500/10 transition-colors cursor-pointer"
      >
        <MailPlus className="size-5" />
      </label>

      {/* Modal */}
      <input type="checkbox" id="new-message-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-base-300 text-base-content p-0 rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-200">
            <h3 className="font-bold text-lg">New message</h3>
            <label
              htmlFor="new-message-modal"
              className="size-8 flex items-center justify-center rounded-full hover:bg-gray-500/10 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </label>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-base-200">
            <input
              type="text"
              placeholder="Search people"
              className="input input-bordered input-sm w-full bg-base-200"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* User list */}
          <div className="max-h-80 overflow-y-auto">
            {isSearchingUsers ? (
              <SearchUsersSkeleton />
            ) : (
              queriedUsers.map((user, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-4 hover:bg-base-100 cursor-pointer ${
                    pickedUser?._id === user._id ? "bg-base-200" : ""
                  }`}
                  onClick={() => pickUser(user)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={user.profilePicture || "/avatar.png"}
                          alt={user.fullName}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-sm opacity-50">{user.email}</p>
                    </div>
                  </div>
                  {pickedUser?._id === user._id && (
                    <Check className="size-4 text-green-500" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-base-200 flex justify-end">
            <button
              className="btn btn-primary btn-sm"
              disabled={!pickedUser}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>

        <label
          htmlFor="new-message-modal"
          className="modal-backdrop cursor-pointer"
        ></label>
      </div>
    </>
  );
}
