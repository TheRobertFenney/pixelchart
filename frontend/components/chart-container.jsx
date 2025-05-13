'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { CanvasChart } from "./canvas-chart";
import { ColorPicker } from "./colorpicker";
import { Button } from "@/components/ui/button";
import { Eraser, Paintbrush } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AuthOverlay } from "./auth-overlay";
import { useSpacetime } from '@/lib/hooks/useSpacetime.tsx';

function ChartSkeleton() {
  return (
    <div className="w-[480px] h-[480px] bg-[#151515] border border-[#333] rounded-none shadow-xl animate-pulse" />
  );
}

function ToolsSkeleton() {
  return (
    <div className="flex gap-2 justify-center">
      <div className="w-10 h-10 bg-[#151515] rounded-md animate-pulse" />
      <div className="w-10 h-10 bg-[#151515] rounded-md animate-pulse" />
    </div>
  );
}

function ChartContainer() {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [currentTool, setCurrentTool] = useState('brush');
  const { isSignedIn } = useUser();
  const { client, isConnected, error, pixels } = useSpacetime();

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    setCurrentTool('brush');
  }, []);

  const handlePixelClick = useCallback((index, isErasing, shouldChangeTool) => {
    if (!isSignedIn || !client) return;
    
    if (shouldChangeTool) {
      setCurrentTool(isErasing ? 'eraser' : 'brush');
    }

    client.paint([index], isErasing ? undefined : selectedColor);
  }, [isSignedIn, client, selectedColor]);

  if (error) {
    return (
      <div className="text-red-500">
        Error connecting to SpacetimeDB: {error}
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex gap-8 items-start relative">
        {!isConnected ? <ChartSkeleton /> : (
          <CanvasChart 
            onPixelClick={handlePixelClick} 
            selectedColor={selectedColor}
            currentTool={currentTool}
            pixels={pixels}
          />
        )}
        <div className="flex flex-col gap-4">
          <ColorPicker onColorChange={handleColorChange} />
          {!isConnected ? <ToolsSkeleton /> : (
            <div className="flex gap-2 justify-center">
              <Button
                variant={currentTool === 'brush' ? 'default' : 'secondary'}
                size="icon"
                onClick={() => isSignedIn && setCurrentTool('brush')}
                className={cn(
                  "w-10 h-10 relative",
                  currentTool === 'brush' && "ring-2 ring-white/50 ring-offset-2 ring-offset-[#1a1a1a]"
                )}
              >
                <Paintbrush className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'eraser' ? 'default' : 'secondary'}
                size="icon"
                onClick={() => isSignedIn && setCurrentTool('eraser')}
                className={cn(
                  "w-10 h-10 relative",
                  currentTool === 'eraser' && "ring-2 ring-white/50 ring-offset-2 ring-offset-[#1a1a1a]"
                )}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {!isSignedIn && (
          <AuthOverlay className="rounded-lg">
            <Button 
              variant="default" 
              size="lg"
              className="relative bg-white text-black hover:text-black hover:bg-white/90 transition-colors duration-300"
            >
              Sign In
            </Button>
          </AuthOverlay>
        )}
      </div>
    </div>
  );
}

export default ChartContainer; 