import { useState, useCallback, useRef } from "react";

interface SSEMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useSSEChat() {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    // Add user message immediately
    const userMsg: SSEMessage = { id: Date.now().toString(), role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Placeholder for assistant message
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to send message");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMsgId ? { ...m, content: m.content + data.content } : m
                  ));
                }
                if (data.done) {
                  done = true;
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Chat error:", error);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const loadHistory = useCallback((history: any[]) => {
    setMessages(history.map(m => ({
      id: m.id.toString(),
      role: m.role as "user" | "assistant",
      content: m.content
    })));
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming, clearMessages, loadHistory };
}

export function useSSEAnalysis(endpoint: string) {
  const [result, setResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(async (body: any) => {
    setIsAnalyzing(true);
    setResult("");
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Analysis failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  setResult(prev => prev + data.content);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setResult("An error occurred during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [endpoint]);

  return { result, isAnalyzing, analyze };
}
