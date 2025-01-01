import React from "react";
import { IconBrandGithub } from "@tabler/icons-react";
import Feedback from "./feedback";

const GroomingFooter = () => {
  const currentDate = new Date().getFullYear();
  return (
    <footer className="grooming-footer">
      <div className="grooming-footer__content">
        <div className="grooming-footer__content-copyright">
          © 2023 - {currentDate} GuruBu
        </div>
        <a
          href="https://github.com/Trendyol/gurubu"
          target="_blank"
          className="grooming-footer__content-socials-container"
        >
          <p>Contribute!</p> <IconBrandGithub />
        </a>
        <Feedback />
      </div>
    </footer>
  );
};

export default GroomingFooter;
