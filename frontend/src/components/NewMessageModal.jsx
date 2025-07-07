import React from "react";

export default function NewMessageModal() {
  return (
    <>
      {/* Trigger */}
      <label htmlFor="new-message-modal" className="btn">
        New Message
      </label>

      {/* Modal */}
      <input type="checkbox" id="new-message-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-base-300 text-base-content p-0 rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-200">
            <h3 className="font-bold text-lg">New message</h3>
            <label htmlFor="new-message-modal" className="btn btn-sm btn-ghost">
              ✕
            </label>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-base-200">
            <input
              type="text"
              placeholder="Search people"
              className="input input-bordered input-sm w-full bg-base-200"
            />
          </div>

          {/* Create group */}
          <div className="p-4 border-b border-base-200 hover:bg-base-100 cursor-pointer">
            <span className="text-primary">+ Create a group</span>
          </div>

          {/* User list */}
          <div className="max-h-80 overflow-y-auto">
            {[
              {
                name: "King Wow",
                handle: "@wowthatshiphop",
                avatar: "https://randomuser.me/api/portraits/men/1.jpg",
              },
              {
                name: "Apple Support",
                handle: "@AppleSupport",
                avatar:
                  "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
              },
            ].map((user, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 hover:bg-base-100 cursor-pointer"
              >
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm opacity-50">{user.handle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-base-200 flex justify-end">
            <button className="btn btn-primary btn-sm">Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
