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
    const { selectedUser, messages } = get();

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSendingMessage: false });
    }
  },
  subscribeToMessages: () => {
    const { selectedUser, messages } = get();

    if (!selectedUser) {
      return;
    }

    const socket = useAuthStore.getState().socket;

    // optimize later
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) {
        return; // Ignore messages not from the selected user
      }
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
