import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: existingTags } = useTags();

  // Parse comma-separated value into array of tags
  const tags = value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const filteredSuggestions = existingTags?.filter(tag => 
    inputValue && 
    tag.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(tag)
  ) || [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      onChange(newTags.join(', '));
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Add any remaining input as a tag on blur
    if (inputValue.trim()) {
      addTag(inputValue);
    }
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          "flex flex-wrap gap-1.5 p-2 min-h-10 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="flex items-center gap-1 pr-1"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
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
