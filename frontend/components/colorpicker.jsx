'use client';

import { useEffect, useRef, useState } from 'react';
import iro from '@jaames/iro';
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Label } from "@/frontend/components/ui/label";
import { cn } from "@/lib/utils";

function ColorPickerSkeleton() {
  return (
    <Card className={cn(
      "w-[280px] bg-[#1a1a1a] border-[#333]",
      "dark:bg-[#1a1a1a] dark:border-[#333]"
    )}>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white dark:text-white">Color Picker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Color wheel skeleton */}
          <div className="w-[200px] h-[200px] rounded-full bg-[#151515] animate-pulse" />
          {/* Value slider skeleton */}
          <div className="w-[200px] h-[20px] rounded-md bg-[#151515] animate-pulse" />
          <Label className="mt-4 text-sm text-gray-300 dark:text-gray-300 block text-center">
            Select a color for your pixel art
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

export function ColorPicker({ onColorChange }) {
  const pickerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (!pickerRef.current || colorPickerRef.current) return;

    try {
      colorPickerRef.current = new iro.ColorPicker(pickerRef.current, {
        width: 200,
        color: "#ffffff",
        borderWidth: 1,
        borderColor: "#333",
        layout: [
          { 
            component: iro.ui.Wheel,
            options: {}
          },
          {
            component: iro.ui.Slider,
            options: {
              sliderType: 'value'
            }
          }
        ]
      });

      colorPickerRef.current.on('color:change', (color) => {
        onColorChange?.(color.hexString);
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize color picker:', error);
      setIsLoading(false);
    }

    return () => {
      if (colorPickerRef.current) {
        // Clean up iro instance if needed
        colorPickerRef.current = null;
      }
    };
  }, [onColorChange]);

  return (
    <Card className={cn(
      "w-[280px] bg-[#1a1a1a] border-[#333]",
      "dark:bg-[#1a1a1a] dark:border-[#333]"
    )}>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white dark:text-white">Color Picker</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-[200px] h-[200px] rounded-full bg-[#151515] animate-pulse" />
            <div className="w-[200px] h-[20px] rounded-md bg-[#151515] animate-pulse" />
          </div>
        )}
        <div 
          ref={pickerRef}
          aria-label="Interactive color wheel and value slider"
          role="application"
          tabIndex="0"
          className={cn(
            "flex justify-center",
            isLoading && "hidden"
          )}
        />
        <Label className="mt-4 text-sm text-gray-300 dark:text-gray-300 block text-center">
          Select a color for your pixel art
        </Label>
      </CardContent>
    </Card>
  );
}
