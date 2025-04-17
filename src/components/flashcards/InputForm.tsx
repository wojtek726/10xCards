import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface InputFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export const InputForm = ({ value, onChange, onSubmit, disabled }: InputFormProps) => {
  const textareaId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length > 0) {
      onSubmit(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={textareaId}>Wprowadź tekst do wygenerowania fiszki</Label>
        <Textarea
          id={textareaId}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszkę..."
          disabled={disabled}
          required
          minLength={1}
          maxLength={1000}
          className="min-h-[150px]"
          aria-describedby="input-description"
        />
        <p id="input-description" className="text-sm text-muted-foreground">
          Tekst powinien mieć od 1 do 1000 znaków.
        </p>
      </div>
      <Button type="submit" disabled={disabled || value.trim().length === 0}>
        Generuj fiszkę
      </Button>
    </form>
  );
};
