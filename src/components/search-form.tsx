"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { getSearchSuggestions, type SearchSuggestion } from "@/lib/search-suggestions";

type SearchFormProps = {
  defaultValue?: string;
  compact?: boolean;
  fromPriceCompare?: boolean;
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

export function SearchForm({ defaultValue = "", compact = false, fromPriceCompare = false }: SearchFormProps) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const [inputState, setInputState] = useState({ defaultValue, value: defaultValue });
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !formRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [isOpen]);
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
      if (fromPriceCompare && suggestion.type === "product" && suggestion.slug) {
        trackEvent("shopping_product_open", {
          language: "ko", source_page: "price_compare", placement: "autocomplete",
          product_slug: suggestion.slug,
        });
        setIsOpen(false);
        router.push(`/product/${suggestion.slug}`);
        return;
      }
    }

    trackEvent("search_submit", {
      query: nextQuery,
    });

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
    setIsOpen(false);
  }

  return (
    <form
      ref={formRef}
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
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={isOpen && suggestions.length ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          onChange={(event) => {
            updateQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && isOpen) {
              event.preventDefault();
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
                <span>{getSuggestionMeta(suggestion)}{fromPriceCompare && suggestion.type === "product" && " · 가격 보기"}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <button className="search-button" type="submit">
        비교하기
      </button>
    </form>
  );
}
