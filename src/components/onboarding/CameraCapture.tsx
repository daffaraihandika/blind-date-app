"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RotateCcw,
  Check,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CameraCaptureProps {
  onCaptureComplete: (imageBlob: Blob, previewUrl: string) => void;
}

export default function CameraCapture({ onCaptureComplete }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "streaming" | "captured" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Bind video stream whenever stream is ready
  useEffect(() => {
    if (videoRef.current && stream && cameraState === "streaming") {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch((err) => {
          console.warn("Video play error:", err);
        });
      };
    }
  }, [stream, cameraState]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Kamera tidak didukung oleh browser ini.");
      }

      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // kamera depan
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraState("streaming");
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraState("error");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage(
          "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda untuk mengambil selfie verifikasi."
        );
      } else {
        setErrorMessage("Tidak dapat membuka kamera. Pastikan webcam/kamera depan tidak sedang digunakan aplikasi lain.");
      }
    }
  }, [stream]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture Snapshot
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger flash animation
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const size = Math.min(width, height);

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Center crop & flip horizontally for natural mirror look
    ctx.translate(size, 0);
    ctx.scale(-1, 1);

    const sx = (width - size) / 2;
    const sy = (height - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setCapturedImage(previewUrl);
          setCameraState("captured");
          stopCamera();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  // Retake Photo
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera();
  };

  // Confirm and Submit
  const handleConfirm = () => {
    if (capturedBlob && capturedImage) {
      onCaptureComplete(capturedBlob, capturedImage);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-5 text-center">
      {/* Hidden Canvas for snapshot processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewport / Preview Box */}
      <div className="relative w-full max-w-[320px] aspect-square rounded-[36px] overflow-hidden bg-zinc-950 border-2 border-rose-500/30 shadow-2xl flex items-center justify-center mb-5">
        {/* Flash Effect */}
        <AnimatePresence>
          {isFlashActive && (
            <motion.div
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* State: Captured Preview */}
        {cameraState === "captured" && capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Selfie Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Check className="w-3.5 h-3.5" />
              <span>Foto Siap</span>
            </div>
          </div>
        ) : null}

        {/* State: Active Video Streaming */}
        {cameraState === "streaming" && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            <div className="absolute top-3 left-3 bg-rose-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE KAMERA</span>
            </div>
          </div>
        )}

        {/* State: Idle / Start Prompt */}
        {cameraState === "idle" && (
          <div className="flex flex-col items-center p-6 text-zinc-400">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 mb-3 shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-xs text-zinc-300 font-medium max-w-[200px] leading-relaxed">
              Ambil selfie langsung dari kamera untuk memverifikasi keaslian akun
            </p>
          </div>
        )}

        {/* State: Requesting / Loading */}
        {cameraState === "requesting" && (
          <div className="flex flex-col items-center p-6 text-zinc-400 gap-2">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-xs text-zinc-300">Menghubungkan ke kamera...</p>
          </div>
        )}

        {/* State: Error */}
        {cameraState === "error" && (
          <div className="flex flex-col items-center p-5 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-xs text-zinc-300 leading-snug mb-3">
              {errorMessage || "Kamera tidak dapat dibuka."}
            </p>
          </div>
        )}
      </div>

      {/* Safety Notice Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[11px] font-semibold text-rose-600 dark:text-rose-300 mb-5">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Wajib Kamera Langsung (Anti-Catfish)</span>
      </div>

      {/* Action Controls */}
      <div className="w-full max-w-[320px] flex flex-col gap-2.5">
        {cameraState === "idle" && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={startCamera}
            leftIcon={<Camera className="w-5 h-5" />}
          >
            Buka Kamera Depan
          </Button>
        )}

        {cameraState === "streaming" && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={capturePhoto}
            leftIcon={<Sparkles className="w-5 h-5" />}
            className="shadow-brand"
          >
            Ambil Foto Selfie
          </Button>
        )}

        {cameraState === "captured" && (
          <div className="flex gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={handleRetake}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Foto Ulang
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleConfirm}
              rightIcon={<Check className="w-4 h-4" />}
            >
              Gunakan Foto
            </Button>
          </div>
        )}

        {cameraState === "error" && (
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={startCamera}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Coba Buka Kamera Lagi
          </Button>
        )}
      </div>
    </div>
  );
}
