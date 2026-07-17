import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Paul Suk` : "Paul Suk";
    return () => { document.title = "Paul Suk"; };
  }, [title]);
}
