import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  RotateCcw,
  Trash2,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Download,
  AlertCircle,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export interface DigitalSignaturePadProps {
  onSaveSignature: (signatureData: {
    dataUrl: string;
    isEmpty: boolean;
    strokeCount: number;
  }) => void;
  onCancel?: () => void;
  signerName?: string;
  signerCpf?: string;
  signerRoleLabel?: string;
  defaultInkColor?: string;
  width?: number;
  height?: number;
  showLegalStamp?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSaveSignature,
  onCancel,
  signerName = 'Paciente',
  signerCpf,
  signerRoleLabel = 'Assinatura do Paciente',
  defaultInkColor = '#1e3a8a', // Deep Blue (caneta tradicional)
  width = 600,
  height = 200,
  showLegalStamp = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [inkColor, setInkColor] = useState<string>(defaultInkColor);
  const [strokeWidth, setStrokeWidth] = useState<number>(2.8);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [signatureGenerated, setSignatureGenerated] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Available Ink Colors
  const INK_COLORS = [
    { label: 'Azul Caneta', value: '#1e3a8a', bgClass: 'bg-blue-900' },
    { label: 'Grafite Escuro', value: '#0f172a', bgClass: 'bg-slate-900' },
    { label: 'Verde Clínico', value: '#065f46', bgClass: 'bg-emerald-800' },
  ];

  // Helper to get point from mouse or touch event relative to canvas
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      time: Date.now(),
    };
  };

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw baseline guideline
    ctx.save();
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const baselineY = canvas.height * 0.78;
    ctx.beginPath();
    ctx.moveTo(30, baselineY);
    ctx.lineTo(canvas.width - 30, baselineY);
    ctx.stroke();

    // Draw "X" indicator
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('✕', 14, baselineY + 4);
    ctx.restore();

    // Helper to draw smooth stroke using quadratic curves
    const drawStroke = (stroke: Stroke) => {
      if (stroke.points.length === 0) return;

      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.points.length === 1) {
        // Draw single dot
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }

        // Connect the last point
        const last = stroke.points[stroke.points.length - 1];
        const prev = stroke.points[stroke.points.length - 2];
        ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
        ctx.stroke();
      }
      ctx.restore();
    };

    // Draw completed strokes
    strokes.forEach(drawStroke);

    // Draw current active stroke
    if (currentStroke) {
      drawStroke(currentStroke);
    }
  }, [strokes, currentStroke]);

  // Adjust canvas resolution with devicePixelRatio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const actualWidth = rect.width || width;
    const actualHeight = rect.height || height;

    canvas.width = actualWidth;
    canvas.height = actualHeight;

    redrawCanvas();
  }, [width, height, redrawCanvas, isFullScreen]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Start Drawing Handler
  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const pt = getCoordinates(e);
    if (!pt) return;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [pt],
      color: inkColor,
      width: strokeWidth,
    };
    setCurrentStroke(newStroke);
    setHasDrawn(true);
  };

  // Move Drawing Handler
  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const pt = getCoordinates(e);
    if (!pt) return;

    setCurrentStroke((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: [...prev.points, pt],
      };
    });
  };

  // End Drawing Handler
  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  // Clear signature canvas
  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setHasDrawn(false);
    setSignatureGenerated(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    redrawCanvas();
  };

  // Undo last stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    if (newStrokes.length === 0) {
      setHasDrawn(false);
    }
  };

  // Export signature as clean trimmed image
  const generateExportDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return null;

    // Create export canvas with transparent background without guidelines
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return null;

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        const last = stroke.points[stroke.points.length - 1];
        const prev = stroke.points[stroke.points.length - 2];
        ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
        ctx.stroke();
      }
      ctx.restore();
    });

    return exportCanvas.toDataURL('image/png');
  };

  const handleConfirm = () => {
    if (strokes.length === 0) {
      onSaveSignature({
        dataUrl: '',
        isEmpty: true,
        strokeCount: 0,
      });
      return;
    }

    const dataUrl = generateExportDataUrl();
    if (dataUrl) {
      setSignatureGenerated(dataUrl);
      onSaveSignature({
        dataUrl,
        isEmpty: false,
        strokeCount: strokes.length,
      });
    }
  };

  const handleDownload = () => {
    const dataUrl = generateExportDataUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `assinatura_${signerName.replace(/\s+/g, '_').toLowerCase()}.png`;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col ${
        isFullScreen
          ? 'fixed inset-0 z-50 p-6 bg-slate-900/95 flex items-center justify-center'
          : 'p-4 sm:p-5'
      } ${className}`}
    >
      <div
        className={`w-full ${
          isFullScreen ? 'max-w-4xl bg-white p-6 rounded-3xl shadow-2xl border border-slate-700' : ''
        }`}
      >
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center">
              <PenTool className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                {signerRoleLabel}
              </h4>
              <p className="text-[11px] text-slate-500">
                Assine no campo abaixo usando o dedo, caneta stylus ou mouse.
              </p>
            </div>
          </div>

          {/* Controls: Color, Stroke Width, FullScreen */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Ink Color Picker */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {INK_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setInkColor(c.value)}
                  title={c.label}
                  className={`w-5 h-5 rounded-lg ${c.bgClass} transition-transform ${
                    inkColor === c.value ? 'scale-110 ring-2 ring-teal-500 ring-offset-1' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            {/* Stroke Width Selector */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setStrokeWidth(1.8)}
                className={`px-2 py-0.5 rounded-lg transition ${
                  strokeWidth === 1.8 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Fina
              </button>
              <button
                type="button"
                onClick={() => setStrokeWidth(2.8)}
                className={`px-2 py-0.5 rounded-lg transition ${
                  strokeWidth === 2.8 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Média
              </button>
              <button
                type="button"
                onClick={() => setStrokeWidth(4.2)}
                className={`px-2 py-0.5 rounded-lg transition ${
                  strokeWidth === 4.2 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Forte
              </button>
            </div>

            {/* Tablet Mode / Full Screen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1 text-[11px] font-semibold"
              title={isFullScreen ? 'Sair do Modo Tela Cheia' : 'Modo Tablet / Tela Cheia para Paciente'}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden sm:inline">Modo Tablet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canvas Area with Touch & Mouse Handling */}
        <div className="relative mt-3">
          <div
            className="w-full relative bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-400 focus-within:border-teal-500 transition-colors overflow-hidden select-none shadow-inner"
            style={{ height: isFullScreen ? '320px' : `${height}px` }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              onTouchCancel={handleEnd}
              className="w-full h-full touch-none cursor-crosshair block"
              style={{ touchAction: 'none' }}
            />

            {!hasDrawn && strokes.length === 0 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5 opacity-80">
                <PenTool className="w-6 h-6 text-slate-300 animate-pulse" />
                <span className="text-xs font-medium">
                  Toque com o dedo ou arraste o mouse para assinar
                </span>
                <span className="text-[10px] text-slate-400">
                  (Assinatura com validade jurídica eletrônica)
                </span>
              </div>
            )}
          </div>

          {/* Canvas Floating Action Buttons (Undo / Clear) */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="px-2 py-1 bg-white/90 hover:bg-white text-slate-700 disabled:opacity-40 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition backdrop-blur-xs"
              title="Desfazer último traço"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Desfazer</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="px-2 py-1 bg-white/90 hover:bg-rose-50 text-rose-600 disabled:opacity-40 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition backdrop-blur-xs"
              title="Limpar assinatura inteira"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Signer Identification & Legal Stamp Bar */}
        {showLegalStamp && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">{signerName}</span>
                {signerCpf && (
                  <span className="text-slate-500 ml-1.5">CPF: {signerCpf}</span>
                )}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <span>Carimbo Temporal:</span>
              <strong className="text-slate-700 font-mono">
                {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {strokes.length > 0 && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1"
                title="Baixar imagem PNG da assinatura"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PNG</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={strokes.length === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Assinatura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
