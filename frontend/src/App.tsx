import Container from "./components/container/Container.tsx";
import Chat from "./pages/chat/Chat.tsx";
import Home from "./pages/home/Home.tsx";
import usePageStore from "./store/page.store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const page = usePageStore((state) => state.currentPage);

  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        {page === "home" && <Home />}
        {page === "chat" && <Chat />}
      </Container>
    </QueryClientProvider>
  );
}

export default App;
