import { IntroStep } from "intro.js/src/core/steps";

export const groomingBoardTour = [
  {
    title: "Hello!",
    element: null,
    intro: "Welcome to GuruBu!",
  },
  {
    title: "Voting Stick",
    element: ".grooming-board__voting-sticks",
    intro:
      "You can vote easily in this area, when you want to change your vote, just press a different card!",
  },
  {
    title: "Participant Logs",
    element: ".grooming-board__logs-section",
    intro:
      "In this area, you will be able to see who voted along with you until admin reveals the votes. When admin reveals the votes, the score ranking from high to low and the average score will be revealed.",
    position: "left",
  },
  {
    title: "Jira Table",
    element: ".grooming-navbar__content-import-jira-issues",
    intro:
      "You can easily access the Jira board, to see the details, you can click import jira ( only admins can see the button ).",
    position: "bottom",
  },
  {
    title: "Copy Link",
    element: ".grooming-navbar__content-copy-link",
    intro:
      "By clicking this button, you can copy the room link and share it with the people you want to attend the grooming!",
    position: "bottom",
  },
  {
    title: "Timer",
    element: ".timer-container",
    intro:
      "By clicking this button, you can adjust the duration of the topic to be discussed at the grooming!",
    position: "bottom",
  },
  {
    title: "Select Theme",
    element: ".theme-selector-container",
    intro: "You can browse our different themes here!",
    position: "bottom",
  },
  {
    title: "Profile",
    element: ".grooming-board-profile",
    intro:
      "If you want to change your nickname or leave the room, you can visit your profile.",
    position: "bottom",
  },
  {
    title: "That's it!",
    element: ".feedback-content",
    intro: "If you have any questions or comments, you can always contact us! ",
    position: "top",
  },
] as Partial<IntroStep>[];
