import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  queriedUsers: [],
  isSearchingUsers: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessagedUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/messages/messaged-users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (formData) => {
    const { selectedUser, messages, users } = get();

    if (!selectedUser) {
      toast.error("Please select a user to send a message.");
      return;
    }

    set({ isSendingMessage: true });

    try {
      const response = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      set({
        messages: [...messages, response.data],
      });

      const updatedUsers = [
        selectedUser,
        ...users.filter((u) => u._id !== selectedUser._id),
      ];
      set({ users: updatedUsers });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSendingMessage: false });
    }
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, users, messages } = get();

      // 1. If the message is from the selected user, append to messages
      if (selectedUser?._id === newMessage.senderId) {
        set({
          messages: [...messages, newMessage],
        });
      }

      // 2. Reorder the users list regardless of selection
      const senderUser = users.find((u) => u._id === newMessage.senderId);

      // Optionally fetch sender details if they don’t exist in users list
      if (senderUser) {
        const reordered = [
          senderUser,
          ...users.filter((u) => u._id !== newMessage.senderId),
        ];
        set({ users: reordered });
      } else {
        // Optional: if sender is not in users list, fetch their info and prepend
        axiosInstance
          .get(`/auth/users/${newMessage.senderId}`)
          .then((res) => {
            const newSender = res.data;
            console.log(newSender);
            set({
              users: [newSender, ...users],
            });
          })
          .catch((err) => {
            console.error("Failed to fetch sender user", err);
          });
      }
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");
  },
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ queriedUsers: [], isSearchingUsers: false });
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/messages/users?query=${query}`
      );
      set({ queriedUsers: response.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
    } finally {
      set({ isSearchingUsers: false });
    }
  },
  setIsSearchingUsers: (isSearching) => set({ isSearchingUsers: isSearching }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
