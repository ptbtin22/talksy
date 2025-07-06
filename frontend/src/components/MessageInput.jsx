import { useState, useRef, useEffect } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../stores/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  const { sendMessage, isSendingMessage } = useChatStore();

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    fileInputRef.current.value = null; // Reset the file input
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !image) {
      toast.error("Please enter a message or select an image.");
      return;
    }

    const formData = new FormData();

    formData.append("text", text.trim());
    formData.append("image", image);

    await sendMessage(formData);

    setText("");
    removeImage();
  };

  return (
    <div className="p-4 w-full">
      {image && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Image Preview"
              className="size-40 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${image ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !image) || isSendingMessage}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
