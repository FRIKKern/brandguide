import React from 'react';
// Updated import for the modern library
import { PortableText, PortableTextComponents } from '@portabletext/react';

// Import converted TSX component serializers
import Image from '../Image/Image';
import ColorPreview from '../ColorPreview/ColorPreview';
import TextStyles from '../TextStyles/TextStyles';
import ColorCombinations from '../ColorCombinations/ColorCombinations';
import ImageAndTextGrid from '../ImageAndTextGrid/ImageAndTextGrid';
import FileUpload from '../FileUpload/FileUpload';
import VideoGrid from '../VideoGrid/VideoGrid';
import ImageGrid from '../ImageGrid/ImageGrid';

// Define props interface
interface BlockContentProps {
  blocks: any[]; // Use a more specific Sanity block array type if available
}

// Define components mapping for @portabletext/react
const ptComponents: PortableTextComponents = {
  types: {
    // Ensure props match what the child component expects
    // Image expects `image` prop
    image: ({ value }) => <Image image={value} />, 
    // These components expect the whole `node` object (containing the relevant data)
    colors: ({ value }) => <ColorPreview node={value} />, 
    textStyles: ({ value }) => <TextStyles node={value} />, 
    colorCombinations: ({ value }) => <ColorCombinations node={value} />, 
    imageAndTextGrid: ({ value }) => <ImageAndTextGrid node={value} />, 
    fileUpload: ({ value }) => <FileUpload node={value} />, 
    videos: ({ value }) => <VideoGrid node={value} />,
    imageGrid: ({ value }) => <ImageGrid node={value} />, 
    unknownType: ({ value }) => {
      console.warn('Encountered unknown block type:', value?._type);
      return null;
    },
  },
  marks: {
    // Define any custom mark components here if needed
    link: ({children, value}) => (
      <a href={value?.href} className="text-[#3A66F8] hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  block: {
    // Override default block rendering for better spacing and hierarchy
    h1: ({children}) => <h1 className="text-4xl font-light mt-12 mb-6 uppercase tracking-normal">{children}</h1>,
    h2: ({children}) => <h2 className="text-3xl font-light mt-10 mb-4 uppercase tracking-normal">{children}</h2>,
    h3: ({children}) => <h3 className="text-2xl font-light mt-8 mb-3 uppercase tracking-normal">{children}</h3>,
    h4: ({children}) => <h4 className="text-xl font-light mt-6 mb-2 uppercase tracking-normal">{children}</h4>,
    h5: ({children}) => <h5 className="text-lg font-normal mt-5 mb-2">{children}</h5>,
    h6: ({children}) => <h6 className="text-base font-normal mt-4 mb-2">{children}</h6>,
    normal: ({children}) => <p className="mb-6 leading-relaxed">{children}</p>,
    blockquote: ({children}) => (
      <blockquote className="pl-4 border-l-4 border-gray-300 italic my-6">
        {children}
      </blockquote>
    ),
  },
  list: {
    // Override list rendering for better spacing
    bullet: ({children}) => <ul className="list-disc pl-5 mb-6 space-y-2">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-5 mb-6 space-y-2">{children}</ol>,
  },
  listItem: {
    // Override list item rendering for better spacing
    bullet: ({children}) => <li className="mb-1">{children}</li>,
    number: ({children}) => <li className="mb-1">{children}</li>,
  },
};

const BlockContent: React.FC<BlockContentProps> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) {
     console.warn('BlockContent received no blocks');
     return null;
  }

  // Container with enhanced styling for better readability
  const containerClasses = "max-w-4xl prose lg:prose-xl prose-headings:font-light prose-headings:tracking-normal prose-headings:uppercase prose-headings:font-[Aker_Brygge_Display] prose-a:text-[#3A66F8]"; 

  return (
    <div className="py-8">
      <div className={containerClasses}>
        <PortableText
          value={blocks} 
          components={ptComponents}
          onMissingComponent={(message, options) => {
            // Custom handling for missing components to avoid cluttering console
            console.info(`[Portable Text] ${message}`);
            return null;
          }}
        />
      </div>
    </div>
  );
};

export default BlockContent; 