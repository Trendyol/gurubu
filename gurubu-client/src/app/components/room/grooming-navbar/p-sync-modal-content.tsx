"use client";

import React, { useState } from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import PLogo from "./p-icon";
import Image from "next/image";
import { useAvatar } from "@/contexts/AvatarContext";
import Avatar from "@/components/common/avatar";
import { pProfile } from "@/shared/interfaces";

const PsyncModalContent = ({
  updateProfile,
  closeModal,
}: {
  updateProfile: (profile: pProfile) => void;
  closeModal: () => void;
}) => {
  const { avatar } = useAvatar();
  const { userInfo, groomingInfo, pProfileStorage, setPProfileStorage } =
    useGroomingRoom();
  const [selectedProfile, setSelectedProfile] = useState<"p" | "avatar">(
    localStorage.getItem("pProfile")
      ? JSON.parse(localStorage.getItem("pProfile") || "{}").isSelected
        ? "p"
        : "avatar"
      : "avatar"
  );

  const pUserProfileExists = Boolean(
    groomingInfo?.participants?.[userInfo?.lobby?.userID]?.profile
  );

  const pUserProfile =
    groomingInfo?.participants?.[userInfo?.lobby?.userID]?.profile || {};

  const handleSave = () => {
    if (selectedProfile === "p") {
      updateProfile({ ...pUserProfile, isSelected: true });
      localStorage.setItem(
        "pProfile",
        JSON.stringify({
          ...pProfileStorage,
          isSelected: true,
          isConsentGiven: true,
        })
      );
      setPProfileStorage({
        ...pProfileStorage,
        isSelected: true, isConsentGiven: true, });
    } else {
      updateProfile({ ...pUserProfile, isSelected: false });
      localStorage.setItem(
        "pProfile",
        JSON.stringify({
          ...pProfileStorage,
          isSelected: false,
          isConsentGiven: true,
        })
      );
      setPProfileStorage({
        ...pProfileStorage,
        isSelected: false, isConsentGiven: true, });
    }
    closeModal();
  };

  const handleLoginClick = () => {
    setPProfileStorage({
      ...pProfileStorage,
      isLoginClicked: true,
      isSelected: true,
    });
    localStorage.setItem(
      "pProfile",
      JSON.stringify({
        ...pProfileStorage,
        isLoginClicked: true,
        isSelected: true,
      })
    );
  };

  const handleConsentClick = () => {
    setPProfileStorage({
      ...pProfileStorage,
      isConsentGiven: false,
      isSelected: false,
    });
    localStorage.setItem(
      "pProfile",
      JSON.stringify({
        ...pProfileStorage,
        isConsentGiven: false,
        isSelected: false,
      })
    );
    updateProfile(null as any);
    closeModal();
  };

  if (!pUserProfileExists) {
    return (
      <div className="p-sync-modal-content__container">
        <div className="p-sync-modal-content__header">
          <h2 className="p-sync-modal-content__title">
            <PLogo className="p-sync-modal-content__p-icon" />
            Profile
          </h2>
          <p className="p-sync-modal-content__subtitle">
            All you need to do is log in, return to GuruBu, and refresh the
            page to continue enjoying your experience with your name and profile
            picture.
          </p>
        </div>
        <a
          className="p-sync-modal-content__login-button"
          href={process.env.NEXT_PUBLIC_P_LINK || ""}
          target="_blank"
          rel="noreferrer"
          onClick={handleLoginClick}
        >
          <PLogo className="p-sync-modal-content__p-icon" />
          Login
        </a>
        {pProfileStorage.isLoginClicked && (
          <p className="p-sync-modal-content__login-button-text">
            If you have already logged in, please refresh the page. If you
            think this is an error, please contact us via feedback form.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-sync-modal-content__container">
      <div className="p-sync-modal-content__header">
        <h2 className="p-sync-modal-content__title">
          <PLogo className="p-sync-modal-content__profile-logo" />
          Profile
        </h2>
        <p className="p-sync-modal-content__subtitle">
          Your account is connected, you can choose it if you want.
        </p>
      </div>

      <div className="p-sync-modal-content__profile-selection">
        <div
          className={`p-sync-modal-content__profile-info ${
            selectedProfile === "p"
              ? "p-sync-modal-content__profile-info--selected"
              : ""
          }`}
          onClick={() => setSelectedProfile("p")}
        >
          <input
            type="checkbox"
            checked={selectedProfile === "p"}
            onChange={() => setSelectedProfile("p")}
            className="p-sync-modal-content__profile-checkbox"
          />
          <Image
            className="p-sync-modal-content__profile-picture"
            src={pUserProfile.picture}
            alt="Profile Picture"
            width={100}
            height={100}
          />
          <div className="p-sync-modal-content__profile-details">
            <h3 className="p-sync-modal-content__profile-name">
              {pUserProfile.displayName || "User"}
            </h3>
            <p className="p-sync-modal-content__profile-email">
              {pUserProfile.email || "No email provided"}
            </p>
          </div>
        </div>

        <div
          className={`p-sync-modal-content__profile-info ${
            selectedProfile === "avatar"
              ? "p-sync-modal-content__profile-info--selected"
              : ""
          }`}
          onClick={() => setSelectedProfile("avatar")}
        >
          <input
            type="checkbox"
            checked={selectedProfile === "avatar"}
            onChange={() => setSelectedProfile("avatar")}
            className="p-sync-modal-content__profile-checkbox"
          />
          <Avatar svg={avatar} />
          <div className="p-sync-modal-content__profile-details">
            <h3 className="p-sync-modal-content__profile-name">
              {userInfo?.nickname || "User"}
            </h3>
          </div>
        </div>
      </div>

      <button
        className="p-sync-modal-content__save-button"
        onClick={handleSave}
      >
        Save Selection
      </button>
      <p
        className="p-sync-modal-content__consent-text"
        onClick={handleConsentClick}
      >
        I do not consent to sync my account
      </p>
    </div>
  );
};

export default PsyncModalContent;
