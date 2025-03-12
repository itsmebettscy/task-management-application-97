import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTextCaptured: (text: string) => void;
}

export function VoiceInput({ onTextCaptured }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();
  let recognition: SpeechRecognition | null = null;

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);

    // @ts-ignore - TypeScript doesn't recognize webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event) => {
      finalTranscript = event.results[0][0].transcript;
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        onTextCaptured(finalTranscript);
        toast({
          title: "Voice captured",
          description: "Your voice input has been processed.",
        });
      } else {
        toast({
          title: "No speech detected",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast({
        title: "Voice input error",
        description: `Error: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognition) {
      recognition.stop();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleListening}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        className={isListening ? "bg-red-100 dark:bg-red-900" : ""}
      >
        {isListening ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <MicOff className="h-4 w-4 text-red-500" />
          </motion.div>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
