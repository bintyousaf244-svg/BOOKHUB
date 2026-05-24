import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { WebsiteContent, defaultWebsiteContent, resolveWebsiteContent } from "@/lib/websiteContent";

interface WebsiteContentContextValue {
  content: WebsiteContent;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WebsiteContentContext = createContext<WebsiteContentContextValue>({
  content: defaultWebsiteContent,
  loading: true,
  refresh: async () => {},
});

export function WebsiteContentProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode;
  initialContent?: WebsiteContent;
}) {
  const [content, setContent] = useState<WebsiteContent>(initialContent ?? defaultWebsiteContent);
  const [loading, setLoading] = useState(!initialContent);

  const refresh = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/api/website-content");
      const data = await response.json();
      setContent(resolveWebsiteContent(data.content));
    } catch {
      setContent(initialContent ?? defaultWebsiteContent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      setLoading(false);
      return;
    }

    refresh();
  }, [initialContent]);

  return (
    <WebsiteContentContext.Provider value={{ content, loading, refresh }}>
      {children}
    </WebsiteContentContext.Provider>
  );
}

export function useWebsiteContent() {
  return useContext(WebsiteContentContext);
}
