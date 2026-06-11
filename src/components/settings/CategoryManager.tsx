"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryManagerProps {
  title: string;
  categories: string[];
  onChange: (updated: string[]) => void;
  permanentItems?: string[];
}

export default function CategoryManager({
  title,
  categories,
  onChange,
  permanentItems = [],
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      setError("Category already exists");
      return;
    }

    onChange([...categories, trimmed]);
    setNewCategory("");
    setError("");
  }

  function handleDelete(category: string) {
    onChange(categories.filter((c) => c !== category));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-fintrak-text-primary">
        {title}
      </h3>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isPermanent = permanentItems.includes(cat);
          return (
            <span
              key={cat}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-fintrak-bg border border-fintrak-border text-fintrak-text-primary"
            >
              {cat}
              {!isPermanent && (
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  className="text-fintrak-text-secondary hover:text-fintrak-expense transition-colors"
                  aria-label={`Remove ${cat}`}
                >
                  <X size={13} />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder="New category..."
          value={newCategory}
          onChange={(e) => {
            setNewCategory(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          className="border-fintrak-border focus-visible:ring-fintrak-accent"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          className="border-fintrak-border text-fintrak-text-primary hover:bg-fintrak-bg shrink-0"
        >
          <Plus size={16} />
          Add
        </Button>
      </div>

      {error && <p className="text-xs text-fintrak-expense">{error}</p>}
    </div>
  );
}
