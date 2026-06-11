import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors placeholder:text-muted-foreground"
      />
    </div>
  );
}
