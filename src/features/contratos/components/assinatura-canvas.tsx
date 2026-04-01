"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eraser, Pencil, RotateCcw, Check } from "lucide-react";

interface AssinaturaCanvasProps {
  onSave: (assinaturaBase64: string) => void;
  isLoading?: boolean;
}

export function AssinaturaCanvas({ onSave, isLoading }: AssinaturaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar canvas
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const y = "touches" in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const y = "touches" in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Converter canvas para base64
    const dataURL = canvas.toDataURL("image/png");
    onSave(dataURL);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Assinatura Digital
        </CardTitle>
        <CardDescription>
          Desenhe sua assinatura no campo abaixo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-4 bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex gap-2 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={clearCanvas}
            disabled={!hasDrawn || isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar
          </Button>

          <Button
            type="button"
            onClick={saveSignature}
            disabled={!hasDrawn || isLoading}
          >
            <Check className="mr-2 h-4 w-4" />
            Confirmar Assinatura
          </Button>
        </div>

        {!hasDrawn && (
          <p className="text-sm text-muted-foreground text-center">
            ✍️ Use o mouse ou toque na tela para assinar
          </p>
        )}
      </CardContent>
    </Card>
  );
}

