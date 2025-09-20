import { toast } from "sonner";

export const notifier = {
  success: ({ title, message }: { title: string; message: string }) => {
    toast.success(title, {
      description: message,
      style: {
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #000000",
        color: "#0f172a",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    });
  },
  error: ({ title, message }: { title: string; message: string }) => {
    toast.error(title, {
      description: message,
      style: {
        background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
        border: "1px solid #000000",
        color: "#991b1b",
        boxShadow:
          "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
      },
    });
  },
  networkFailed: () => {
    toast.error("🌐 Connection Failed - Network Issue", {
      description: "Please check your internet connection and try again",
      style: {
        background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
        border: "1px solid #000000",
        color: "#991b1b",
        boxShadow:
          "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
      },
    });
  },
};
