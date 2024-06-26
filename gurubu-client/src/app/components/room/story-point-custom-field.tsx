import { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  closeModal: () => void;
  customFieldName: string;
  setCustomFieldName: (value: string) => void;
};


export const StoryPointCustomFieldForm = ({ customFieldName, setCustomFieldName, closeModal }: Props) => {  
  useEffect(() => {
    const retrieveFromLocalStorage = (key: string, setter: (value: string) => void) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) setter(JSON.parse(storedValue));
    };
    retrieveFromLocalStorage("storyPointCustomFieldName", setCustomFieldName);
  }, []);

  const handleInputChange = (setState: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setState(value);
    localStorage.setItem(e.target.name, JSON.stringify(value));
  };

  const handleSaveButton = async () => {
    closeModal();
  };

  return (
    <form className="story-point-custom-field">
      <div className="story-point-custom-field__logo">
        <Image src="/logo.svg" width={24} height={24} alt="Gurubu Logo" priority />
        <h4>GuruBu</h4>
      </div>
      <h5>Custom field name is required to set vote.</h5>
      <div className="story-point-custom-field__row">
        <input
          placeholder="Story Point Custom Field Name"
          id="storyPointCustomFieldName"
          name="storyPointCustomFieldName"
          value={customFieldName}
          onChange={handleInputChange(setCustomFieldName)}
        />
      </div>
      <div className="story-point-custom-field__row">
        <button type="button" onClick={handleSaveButton}>
          Save
        </button>
      </div>
    </form>
  );
};
