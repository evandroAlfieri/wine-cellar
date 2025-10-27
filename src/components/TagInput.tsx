import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder, className }: TagInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: existingTags } = useTags();

  useEffect(() => {
    // Get the current tag being typed (after the last comma)
    const tags = value.split(',');
    const current = tags[tags.length - 1]?.trim() || '';
    setCurrentInput(current);
  }, [value]);

  const filteredSuggestions = existingTags?.filter(tag => 
    currentInput && 
    tag.toLowerCase().includes(currentInput.toLowerCase()) &&
    !value.split(',').map(t => t.trim()).includes(tag)
  ) || [];

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    tags.pop(); // Remove the incomplete tag
    tags.push(suggestion);
    onChange(tags.join(', ') + ', ');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(tag);
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
