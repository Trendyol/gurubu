import { useAvatar } from "@/contexts/AvatarContext";
import { useState } from "react";
import {
  IconDeviceFloppy,
  IconEyeglass,
  IconPalette,
  IconRefresh,
  IconResize,
} from "@tabler/icons-react";

type Props = {
  closeModal: () => void;
};

const accessoryTypes = [
  { value: "none", label: "None" },
  { value: "kurt", label: "Kurt" },
  { value: "prescription01", label: "Glasses" },
  { value: "prescription02", label: "Round Glasses" },
  { value: "wayfarers", label: "Wayfarers" },
  { value: "eyepatch", label: "Eyepatch" },
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
      <div className="change-avatar-container__header">
        <h2 className="change-avatar-container__header-title">
          Customize Your Avatar
        </h2>
        <p className="change-avatar-container__header-subtitle">
          Make it uniquely yours with colors and accessories
        </p>
      </div>

      <div className="change-avatar-container__preview">
        <div
          className="avatar-preview"
          dangerouslySetInnerHTML={{ __html: createAvatarSvg(previewOptions) }}
        />
      </div>

      <button
        type="button"
        onClick={handleGenerateNew}
        className="change-avatar-container__random-button"
      >
        <IconRefresh size={18} />
        Change Avatar
      </button>

      <div className="change-avatar-container__options">
        <div className="option-group">
          <label>
            <IconPalette
              size={16}
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            />
            Background Color
          </label>
          <div className="color-picker-group">
            <div className="color-picker-group__preview">
              <div
                className="color-swatch"
                style={{
                  backgroundColor: previewOptions.backgroundColor
                    ? `#${previewOptions.backgroundColor}`
                    : "#ffffff",
                }}
              />
              <span className="color-value">
                {previewOptions.backgroundColor || "ffffff"}
              </span>
            </div>
            <input
              type="color"
              value={
                previewOptions.backgroundColor
                  ? `#${previewOptions.backgroundColor}`
                  : "#ffffff"
              }
              onChange={(e) =>
                updatePreview({
                  backgroundColor: [e.target.value.split("#")[1]],
                })
              }
            />
          </div>
        </div>
        <div className="option-group">
          <label>
            <IconResize
              size={16}
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            />
            Avatar Scale
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={previewOptions.scale || 100}
            onChange={(e) => updatePreview({ scale: Number(e.target.value) })}
          />
        </div>
        <div className="option-group">
          <label>
            <IconEyeglass
              size={16}
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            />
            Accessories
          </label>
          <select
            value={previewOptions.accessories || "none"}
            onChange={(e) =>
              updatePreview({
                accessoriesProbability: 100,
                accessories: [e.target.value],
              })
            }
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
        <button type="button" onClick={handleSave} className="save-button">
          <IconDeviceFloppy size={18} />
          Save
        </button>
      </div>
    </div>
  );
};
