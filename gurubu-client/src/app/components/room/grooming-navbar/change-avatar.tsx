import Image from "next/image";
import { useAvatar } from "@/contexts/AvatarContext";
import { useState } from "react";

type Props = {
  closeModal: () => void;
};

const accessoryTypes = [
  { value: "none", label: "None" },
  { value: "kurt", label: "Kurt" },
  { value: "prescription01", label: "Glasses" },
  { value: "prescription02", label: "Round Glasses" },
  { value: "wayfarers", label: "Wayfarers" },
];

export const ChangeAvatar = ({ closeModal }: Props) => {
  const {
    regenerateAvatarOptions,
    updateAvatar,
    createAvatarSvg,
    setAvatar,
    avatarOptions,
    setAvatarOptions,
  } = useAvatar();

  const [previewOptions, setPreviewOptions] = useState(avatarOptions);

  const updatePreview = (updates: Partial<typeof previewOptions>) => {
    const newOptions = { ...previewOptions, ...updates };
    setPreviewOptions(newOptions);
  };

  const handleGenerateNew = () => {
    const options = regenerateAvatarOptions();
    updatePreview(options);
  };

  const handleSave = () => {
    setAvatarOptions(previewOptions);
    setAvatar(createAvatarSvg(previewOptions));
    updateAvatar(previewOptions);
    localStorage.setItem("avatarOptions", JSON.stringify(previewOptions));
    closeModal();
  };

  return (
    <div className="change-avatar-container">
      <div className="change-avatar-container__logo">
        <Image
          src="/logo.svg"
          width={24}
          height={24}
          alt="Gurubu Logo"
          priority
        />
        <h4>GuruBu</h4>
      </div>

      <div className="change-avatar-container__preview">
        <div
          className="avatar-preview"
          dangerouslySetInnerHTML={{ __html: createAvatarSvg(previewOptions) }}
        />
      </div>

      <div className="change-avatar-container__options">
        <div className="option-group">
          <label>Background Color</label>
          <input
            type="color"
            value={
              previewOptions.backgroundColor
                ? `#${previewOptions.backgroundColor}`
                : "#ffffff"
            }
            onChange={(e) =>
              updatePreview({ backgroundColor: [e.target.value.split("#")[1]] })
            }
          />
        </div>
        <div className="option-group">
          <label>Scale</label>
          <input
            type="range"
            min="50"
            max="150"
            value={previewOptions.scale || 100}
            onChange={(e) => updatePreview({ scale: Number(e.target.value) })}
          />
        </div>
        <div className="option-group">
          <label>Accessories</label>
          <select
            value={previewOptions.accessories || "none"}
            onChange={(e) => updatePreview({ accessoriesProbability: 100, accessories: [e.target.value] })}
          >
            {accessoryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="change-avatar-container__actions">
        <button type="button" onClick={handleGenerateNew}>
          Generate New
        </button>
        <button type="button" onClick={handleSave} className="save-button">
          Save Changes
        </button>
      </div>
    </div>
  );
};
