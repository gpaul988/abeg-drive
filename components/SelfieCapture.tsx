"use client";

import { useEffect, useRef, useState } from "react";

interface SelfieCaptureProps {
  onCapture: (base64Image: string) => void;
  disabled?: boolean;
}

/**
 * Requests the device camera, shows a live preview, and captures a real
 * frame to a canvas as a base64 JPEG when the person taps "Take selfie".
 * This replaced an earlier version of this flow that sent a hardcoded
 * placeholder string without ever opening the camera — that was a real
 * gap, not just a cosmetic one, since it meant no selfie was actually
 * being captured or verified.
 */
export function SelfieCapture({ onCapture, disabled }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"idle" | "requesting" | "live" | "denied" | "unsupported">("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("live");
    } catch {
      setStatus("denied");
      setError("Camera access was denied or unavailable. Please allow camera access and try again.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function takeSelfie() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Crop to a centered square so the captured frame matches the preview.
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  }

  function retake() {
    setCapturedImage(null);
    startCamera();
  }

  function confirm() {
    if (capturedImage) onCapture(capturedImage);
  }

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-danger-strong bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="aspect-square bg-ink-850 rounded-xl border border-ink-border overflow-hidden mb-4 relative">
        {status === "requesting" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-paper-faint">
            Requesting camera access…
          </div>
        )}
        {status === "unsupported" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-paper-faint px-6 text-center">
            Your browser doesn&apos;t support camera capture. Please try a different browser or device.
          </div>
        )}
        {status === "denied" && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-sm text-paper-faint">Camera access is required to verify your identity.</span>
            <button
              type="button"
              onClick={startCamera}
              className="text-sm text-amber-strong font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {capturedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capturedImage} alt="Captured selfie" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover scale-x-[-1] ${status === "live" ? "" : "opacity-0"}`}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {capturedImage ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={retake}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-ink-800 border border-ink-border-strong hover:border-paper-dim text-paper transition-colors"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={disabled}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-amber hover:bg-amber-strong disabled:bg-ink-border disabled:text-paper-faint text-ink-950 transition-colors"
          >
            Use this photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={takeSelfie}
          disabled={status !== "live" || disabled}
          className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-amber hover:bg-amber-strong disabled:bg-ink-border disabled:text-paper-faint text-ink-950 transition-colors"
        >
          Take selfie
        </button>
      )}
    </div>
  );
}
