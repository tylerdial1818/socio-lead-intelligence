"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Keyword, KeywordFormData, KeywordType, KeywordTier } from "@/types";

interface AddKeywordDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: KeywordFormData) => void;
  existingKeyword?: Keyword | null;
  categories: string[];
}

interface FormErrors {
  term?: string;
}

const NONE_VALUE = "__none__";

export function AddKeywordDialog({
  open,
  onClose,
  onSubmit,
  existingKeyword,
  categories,
}: AddKeywordDialogProps) {
  const [term, setTerm] = useState("");
  const [type, setType] = useState<KeywordType>("INCLUDE");
  const [tier, setTier] = useState<KeywordTier>("MEDIUM");
  const [category, setCategory] = useState<string>(NONE_VALUE);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = useCallback(() => {
    if (existingKeyword) {
      setTerm(existingKeyword.term);
      setType(existingKeyword.type);
      setTier(existingKeyword.tier);
      setCategory(existingKeyword.category ?? NONE_VALUE);
    } else {
      setTerm("");
      setType("INCLUDE");
      setTier("MEDIUM");
      setCategory(NONE_VALUE);
    }
    setErrors({});
  }, [existingKeyword]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedTerm = term.trim();

    if (!trimmedTerm) {
      newErrors.term = "Keyword term is required.";
    } else if (trimmedTerm.length < 2) {
      newErrors.term = "Keyword must be at least 2 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      term: term.trim().toLowerCase(),
      type,
      tier,
      category: category === NONE_VALUE ? null : category,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingKeyword ? "Edit Keyword" : "Add Keyword"}
          </DialogTitle>
          <DialogDescription>
            {existingKeyword
              ? "Update the keyword configuration below."
              : "Add a new keyword to track in opportunity matching."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Term */}
          <div className="space-y-2">
            <Label htmlFor="keyword-term">Term</Label>
            <Input
              id="keyword-term"
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                if (errors.term) setErrors({});
              }}
              placeholder="e.g. cloud migration"
              className="font-mono"
              autoComplete="off"
            />
            {errors.term && (
              <p className="text-xs text-red-500">{errors.term}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as KeywordType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="INCLUDE" id="type-include" />
                <Label htmlFor="type-include" className="cursor-pointer font-normal">
                  Include
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="EXCLUDE" id="type-exclude" />
                <Label htmlFor="type-exclude" className="cursor-pointer font-normal">
                  Exclude
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tier */}
          <div className="space-y-2">
            <Label>Tier</Label>
            <RadioGroup
              value={tier}
              onValueChange={(v) => setTier(v as KeywordTier)}
              className="space-y-2"
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem value="HIGH" id="tier-high" className="mt-0.5" />
                <div>
                  <Label htmlFor="tier-high" className="cursor-pointer font-normal">
                    High
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Core terms strongly indicating a match
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="MEDIUM" id="tier-medium" className="mt-0.5" />
                <div>
                  <Label htmlFor="tier-medium" className="cursor-pointer font-normal">
                    Medium
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Relevant terms that support a match
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="LOW" id="tier-low" className="mt-0.5" />
                <div>
                  <Label htmlFor="tier-low" className="cursor-pointer font-normal">
                    Low
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Supplementary terms with lower signal
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="keyword-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="keyword-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {existingKeyword ? "Save Changes" : "Add Keyword"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
