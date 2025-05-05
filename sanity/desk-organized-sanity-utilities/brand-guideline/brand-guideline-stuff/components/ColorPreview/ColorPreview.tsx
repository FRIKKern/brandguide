import React from 'react';

import WCAGLabel from '../WCAGLabel/WCAGLabel';
import {
  cleanHex,
  whiteHasHighestContrast,
  toCMYK,
  toHSL,
  toRGB,
  WcagContrast,
} from './colorUtils'; // Import from the new .ts file

// Interface for a single color item
interface ColorProps {
  name: string;
  hex: string;
}

// Interface for the main component props
interface ColorPreviewProps {
  node: {
    colors: ColorProps[];
  };
}

// Internal Color component
const ColorDisplay: React.FC<ColorProps> = ({ name, hex }) => {
  const cleaned = cleanHex(hex);
  const useWhiteText = whiteHasHighestContrast(cleaned);

  // Base classes for the color field card
  const colorFieldClasses = [
    'group', // For hover effect
    'relative', 
    'w-40', // width: 160px
    'border', 
    'border-gray-200', // Assuming --stroke
    'overflow-hidden',
    useWhiteText ? 'text-black' : 'text-black' // Conditional text color based on contrast
  ].join(' ');

  return (
    <div className={colorFieldClasses}>
      {/* Front of the card */}
      <div className="text-current"> {/* Inherit text color set on parent */}
        <div 
          className="w-full h-40 border-b border-gray-200" // Color swatch (Assuming --stroke)
          style={{ backgroundColor: cleaned }}
        />
        <div className="p-2"> {/* Padding for text below swatch */}
          <h4 className="mt-2 mb-0 font-semibold">{name}</h4>
          <p className="mb-2 text-sm font-mono">{cleaned}</p>
        </div>
      </div>

      {/* Back of the card (shown on hover) */}
      <div 
        className="absolute inset-0 border border-gray-200 p-2 bg-white text-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out flex flex-col justify-between" // Back styles (Assuming --stroke, --background-color)
      >
        <div>
          <h4 className="font-semibold">{name}</h4>
          <ul className="m-0 p-0 list-none text-sm space-y-1 mt-1"> {/* List styles */}
            <li><span className="font-mono">HEX: {cleaned}</span></li>
            <li><span className="font-mono">{toRGB(cleaned)}</span></li>
            <li><span className="font-mono">{toHSL(cleaned)}</span></li>
            <li><span className="font-mono">{toCMYK(cleaned)}</span></li>
          </ul>
        </div>
        <div className="space-y-1"> {/* Contrast info section */}
          {/* Contrast vs Black */}
          <div className="flex items-center text-sm">
            <div className="relative w-2.5 h-2.5 inline-block rounded-full border border-gray-400 z-10" style={{ backgroundColor: cleaned }} />
            <div className="relative w-2.5 h-2.5 inline-block rounded-full border border-gray-400 z-0 -ml-1 bg-black" />
            <span className="ml-1.5 font-mono">{WcagContrast('#000000', cleaned)}:1</span>
            <WCAGLabel contrastRatio={WcagContrast('#000000', cleaned)} largeText />
          </div>
          {/* Contrast vs White */}
          <div className="flex items-center text-sm">
            <div className="relative w-2.5 h-2.5 inline-block rounded-full border border-gray-400 z-10" style={{ backgroundColor: cleaned }} />
            <div className="relative w-2.5 h-2.5 inline-block rounded-full border border-gray-400 z-0 -ml-1 bg-white" />
            <span className="ml-1.5 font-mono">{WcagContrast('#FFFFFF', cleaned)}:1</span>
            <WCAGLabel contrastRatio={WcagContrast('#FFFFFF', cleaned)} largeText />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ColorPreview component
const ColorPreview: React.FC<ColorPreviewProps> = ({ node }) => {
  // Return null if node or colors are missing
  if (!node || !node.colors) {
    console.warn('ColorPreview component missing required props');
    return null;
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,160px)]"> {/* Grid container */}
      {node.colors.map((color) => (
        <ColorDisplay {...color} key={color.hex} />
      ))}
    </div>
  );
};

export default ColorPreview; 