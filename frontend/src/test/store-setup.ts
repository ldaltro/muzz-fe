import { resetStore } from "./store-utils";
import usePageStore from "../store/page.store";
import useUserStore from "../store/user.store";
import useMessagesStore from "../store/messages.store";

resetStore(usePageStore, { currentPage: 'home', setCurrentPage: () => {} });
resetStore(useUserStore, {
  currentUser: {
    id: 1,
    name: "Alisha",
    profile: "https://randomuser.me/api/portraits/women/89.jpg",
  },
  setCurrentUser: () => {},
  currentRecipient: null,
  setCurrentRecipient: () => {},
});
resetStore(useMessagesStore, {
  messages: [],
  createMessage: () => {},
});
