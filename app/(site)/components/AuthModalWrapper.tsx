"use client";

import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function AuthModalWrapper() {
  const { showAuthModal, closeAuthModal } = useAuth();

  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={closeAuthModal}
      preventRedirect={false}
    />
  );
}
