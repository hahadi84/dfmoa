"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { getSearchSuggestions, type SearchSuggestion } from "@/lib/search-suggestions";

type SearchFormProps = {
  defaultValue?: string;
  compact?: boolean;
};

function getSuggestionMeta(suggestion: SearchSuggestion) {
  if (suggestion.type === "product") {
    return [suggestion.brand, suggestion.volume, suggestion.category].filter(Boolean).join(" · ");
  }

  if (suggestion.type === "brand") {
    return "브랜드";
  }

  if (suggestion.type === "category") {
    return "카테고리";
  }

  return "인기 검색어";
}

export function SearchForm({ defaultValue = "", compact = false }: SearchFormProps) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const [inputState, setInputState] = useState({ defaultValue, value: defaultValue });
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const query = inputState.defaultValue === defaultValue ? inputState.value : defaultValue;
  const suggestions = useMemo(() => getSearchSuggestions(query), [query]);
  const activeSuggestion = activeIndex >= 0 ? suggestions[activeIndex] : undefined;

  function updateQuery(value: string) {
    setInputState({ defaultValue, value });
  }

  function goToSearch(value: string, suggestion?: SearchSuggestion) {
    const nextQuery = value.trim();

    if (!nextQuery) {
      return;
    }

    if (suggestion) {
      trackEvent("search_suggestion_select", {
        suggestion_type: suggestion.type,
        product_id: suggestion.productId,
        suggestion_slug: suggestion.slug,
      });
    }

    trackEvent("search_submit", {
      query: nextQuery,
    });

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
    setIsOpen(false);
  }

  return (
    <form
      action="/search"
      className={`search-form${compact ? " is-compact" : ""}`}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        goToSearch(activeSuggestion?.value ?? query, activeSuggestion);
      }}
    >
      <label className="sr-only" htmlFor={inputId}>
        상품 검색어
      </label>
      <div className="search-combobox">
        <input
          id={inputId}
          className="search-input"
          type="search"
          name="q"
          value={query}
          placeholder="브랜드 + 상품명 + 용량"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          onChange={(event) => {
            updateQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setActiveIndex(-1);
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, -1));
            }
          }}
        />

        {isOpen && suggestions.length ? (
          <div id={listboxId} className="search-suggestion-list" role="listbox">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.slug ?? suggestion.value}`}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={activeIndex === index ? "is-active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToSearch(suggestion.value, suggestion)}
              >
                <strong>{suggestion.label}</strong>
                <span>{getSuggestionMeta(suggestion)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <button className="search-button" type="submit" aria-label="면세가와 국내가 비교 검색">
        비교하기
      </button>
    </form>
  );
}
