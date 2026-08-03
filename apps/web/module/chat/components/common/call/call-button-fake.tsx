'use client';

import { useEffect, useState } from 'react';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';

// Internal component that handles call logic and UI
const CallDialogContent = ({ onEndCall }: { onEndCall: () => void }) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [isEndCallDialogOpen, setIsEndCallDialogOpen] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLDivElement | null>(null);

  // Initialize audio when component mounts
  useEffect(() => {
    const audio = new Audio('/sounds/call-ringtone.mp3');
    audio.loop = true;
    setAudioRef(audio);

    // Play audio and set up timer to simulate call connection
    audio.play().catch((error) => console.error('Failed to play audio:', error));

    const timer = setTimeout(() => {
      setCallState('connected');
      if (audio) {
        audio.pause();
      }
    }, 5000);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
      }
      closeVideo();
    };
  }, []); // Empty dependency array since this should only run on mount

  // Close video function
  const closeVideo = () => {
    if (videoRef && document.body.contains(videoRef)) {
      document.body.removeChild(videoRef);
      setVideoRef(null);
    }
  };

  // Handle playing the meme video when confirmed to end call
  const playMemeVideo = () => {
    setIsEndCallDialogOpen(false);
    onEndCall();

    // First close any existing video
    closeVideo();

    // Create a fullscreen video element
    const videoElement = document.createElement('div');
    videoElement.style.position = 'fixed';
    videoElement.style.top = '0';
    videoElement.style.left = '0';
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.backgroundColor = 'black';
    videoElement.style.zIndex = '9999';
    videoElement.style.display = 'flex';
    videoElement.style.justifyContent = 'center';
    videoElement.style.alignItems = 'center';
    videoElement.style.overflow = 'hidden';

    setVideoRef(videoElement);

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.width = '50px';
    closeButton.style.height = '50px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.cursor = 'pointer';
    closeButton.style.border = 'none';
    closeButton.style.zIndex = '10000';
    closeButton.style.transition = 'background-color 0.2s';
    closeButton.innerHTML = `
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    };
    closeButton.onclick = closeVideo;

    // Create video player element
    const videoPlayer = document.createElement('video');
    videoPlayer.style.width = '100%';
    videoPlayer.style.height = '100%';
    videoPlayer.style.objectFit = 'cover';
    videoPlayer.controls = false;
    videoPlayer.autoplay = true;
    videoPlayer.loop = true;
    videoPlayer.muted = false;
    videoPlayer.src = 'https://remanga.org/media/HEYYEYAAEYAAAEYAEYAA.mp4';
    videoPlayer.addEventListener('loadedmetadata', () => {
      videoPlayer.play().catch((err) => {
        console.error('Failed to autoplay video:', err);
        const playButton = document.createElement('button');
        playButton.style.position = 'absolute';
        playButton.style.top = '50%';
        playButton.style.left = '50%';
        playButton.style.transform = 'translate(-50%, -50%)';
        playButton.style.width = '80px';
        playButton.style.height = '80px';
        playButton.style.borderRadius = '50%';
        playButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        playButton.style.border = 'none';
        playButton.style.cursor = 'pointer';
        playButton.innerHTML = `
                    <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                `;
        playButton.onclick = () => {
          videoPlayer.play();
          videoElement.removeChild(playButton);
        };
        videoElement.appendChild(playButton);
      });
    });

    videoElement.appendChild(videoPlayer);
    videoElement.appendChild(closeButton);
    document.body.appendChild(videoElement);

    // Auto remove video after it ends (as a fallback)
    setTimeout(() => {
      closeVideo();
    }, 240000); // 4 minute duration (longer than the video for safety)
  };

  return (
    <>
      <DialogContent className="max-w-xs rounded-xl bg-[#181818] text-white sm:max-w-sm">
        <div className="flex flex-col items-center justify-center py-4">
          {/* Profile Picture */}
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-700">
            <img
              src="https://placehold.co/100x100"
              alt="Контакт"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Contact Name */}
          <DialogTitle className="mb-2 text-xl font-bold">Хи-Мэн</DialogTitle>

          {/* Call Status */}
          <p className="mb-6 text-sm text-gray-400">
            {callState === 'ringing' ? 'Вызов...' : 'Соединено'}
          </p>

          {/* Call Controls */}
          <div className="mt-4 flex gap-4">
            <Button
              variant="destructive"
              circle
              className="size-14 bg-red-600 hover:bg-red-700"
              onClick={() => setIsEndCallDialogOpen(true)}
            >
              <Close className="size-6" />
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* End Call Confirmation Dialog */}
      <Dialog open={isEndCallDialogOpen} onOpenChange={setIsEndCallDialogOpen}>
        <DialogContent className="max-w-xs rounded-xl bg-[#181818] text-white sm:max-w-sm">
          <DialogTitle className="mb-4 text-center">
            Вы уверены, что хотите завершить звонок?
          </DialogTitle>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              variant="secondary"
              onClick={playMemeVideo}
              className="bg-[#41CB5E] hover:bg-[#3BB655]"
            >
              Да
            </Button>
            <Button
              variant="default"
              onClick={() => setIsEndCallDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Нет
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main component that only renders the call button and manages dialog state
export const CallButtonFake = () => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  return (
    <Dialog
      open={isCallDialogOpen}
      onOpenChange={(state) => {
        if (!state && isCallDialogOpen) {
          // Don't automatically close the dialog - let the inner component handle it
          return false;
        }
        setIsCallDialogOpen(state);
      }}
    >
      {/* Call Button */}
      <DialogTrigger asChild onClick={() => setIsCallDialogOpen(true)}>
        <Button circle size="lg" variant="secondary">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </Button>
      </DialogTrigger>

      {isCallDialogOpen && <CallDialogContent onEndCall={() => setIsCallDialogOpen(false)} />}
    </Dialog>
  );
};

export default CallButtonFake;
