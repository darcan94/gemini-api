import { RefObject, useEffect, useRef } from "react";

export function useAutoScroll(
    refDependency: any[],
  ): RefObject<HTMLDivElement> {
    const chatListRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const ref = chatListRef.current;
      const scrollToBottom = () => {
        if (ref) {
          ref.scrollTop = ref.scrollHeight;
        }
      };
  
      scrollToBottom();
    }, [refDependency]);
  
    return chatListRef;
}