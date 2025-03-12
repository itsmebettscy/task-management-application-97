
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTextCaptured: (text: string) => void;
}

export function VoiceInput({ onTextCaptured }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if (!('webkitSpeechRecognition' in window) && 
        !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive"
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
    setTranscript("");

    // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (transcript) {
        onTextCaptured(transcript);
        toast({
          title: "Voice captured",
          description: "Your voice input has been processed.",
        });
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast({
        title: "Voice input error",
        description: `Error: ${event.error}`,
        variant: "destructive"
      });
    };
    
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.stop();
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
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <MicOff className="h-4 w-4 text-red-500" />
          </motion.div>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {transcript && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
