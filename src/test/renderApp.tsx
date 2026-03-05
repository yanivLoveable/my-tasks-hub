import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";

const defaultAuth: AuthContextValue = {
  user: { id: "QA_USER_1", name: "QA User 1" },
  status: "ready",
  authenticate: async () => "fake-token",
  logout: vi.fn(),
};

interface RenderAppOptions {
  route?: string;
  authOverride?: Partial<AuthContextValue>;
  initialStorage?: Record<string, string>;
}

export function renderApp(
  ui: React.ReactElement,
  options: RenderAppOptions = {}
) {
  const { route = "/", authOverride, initialStorage } = options;

  // Preload localStorage
  if (initialStorage) {
    Object.entries(initialStorage).forEach(([k, v]) =>
      localStorage.setItem(k, v)
    );
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });

  const authValue: AuthContextValue = { ...defaultAuth, ...authOverride };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <TooltipProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
}
