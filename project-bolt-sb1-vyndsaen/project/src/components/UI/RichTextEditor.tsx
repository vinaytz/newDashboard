import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';
import Button from './Button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarButtons = [
    { icon: Undo, command: 'undo', tooltip: 'Undo' },
    { icon: Redo, command: 'redo', tooltip: 'Redo' },
    { type: 'separator' },
    { icon: Heading1, command: 'formatBlock', value: 'h1', tooltip: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', tooltip: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', tooltip: 'Heading 3' },
    { type: 'separator' },
    { icon: Bold, command: 'bold', tooltip: 'Bold' },
    { icon: Italic, command: 'italic', tooltip: 'Italic' },
    { icon: Underline, command: 'underline', tooltip: 'Underline' },
    { type: 'separator' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
    { type: 'separator' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'Quote' },
    { icon: Code, command: 'formatBlock', value: 'pre', tooltip: 'Code Block' },
    { type: 'separator' },
    { icon: Link, command: 'createLink', tooltip: 'Insert Link' },
    { icon: Image, command: 'insertImage', tooltip: 'Insert Image' },
  ];

  const handleSpecialCommand = (command: string) => {
    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) executeCommand(command, url);
    } else if (command === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) executeCommand(command, url);
    }
  };

  return (
    <div className={`border border-gray-600 rounded-lg bg-gray-800 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-600 flex-wrap">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-gray-600 mx-1" />;
          }

          const Icon = button.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => {
                if (button.command === 'createLink' || button.command === 'insertImage') {
                  handleSpecialCommand(button.command);
                } else {
                  executeCommand(button.command, button.value);
                }
              }}
              title={button.tooltip}
              className="p-1.5"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        
        <div className="ml-auto flex items-center space-x-2">
          <Button
            variant={isPreview ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[200px]">
        {isPreview ? (
          <div 
            className="p-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="p-4 min-h-[200px] focus:outline-none text-gray-100"
            dangerouslySetInnerHTML={{ __html: value }}
            data-placeholder={placeholder}
            style={{
              caretColor: '#3B82F6',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;