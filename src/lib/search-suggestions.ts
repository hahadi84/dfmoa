import { brandLandings } from "@/lib/seo-content";
import { categories, featureSearches, products } from "@/lib/site-data";

export type SearchSuggestion = {
  type: "product" | "brand" | "category" | "popular_query";
  label: string;
  value: string;
  slug?: string;
  brand?: string;
  productId?: string;
  category?: string;
  volume?: string;
  aliases?: string[];
};

export type SearchAlias = {
  canonical: string;
  aliases: string[];
  targetType: "product" | "brand" | "category";
  targetId: string;
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

const manualAliases: SearchAlias[] = [
  {
    canonical: "크리드 어벤투스 50ml",
    aliases: ["크리드어벤투스", "creedaventus", "creed아벤투스50", "어벤투스50ml", "aventus50"],
    targetType: "product",
    targetId: "creed-aventus-50ml",
  },
  {
    canonical: "조말론 잉글리쉬 페어 100ml",
    aliases: [
      "조말론블랙베리",
      "jomaloneblackberry",
      "jomaloneenglishpear",
      "조말론잉글리쉬페어",
      "englishpear100",
    ],
    targetType: "product",
    targetId: "jo-malone-english-pear-100ml",
  },
  {
    canonical: "설화수 윤조에센스 90ml",
    aliases: ["설화수윤조에센스", "sulwhasoofirstcare", "firstcare90", "윤조90"],
    targetType: "product",
    targetId: "sulwhasoo-first-care-serum-90ml",
  },
  {
    canonical: "히비키 하모니 700ml",
    aliases: ["히비키하모니", "hibikiharmony", "hibiki700"],
    targetType: "product",
    targetId: "hibiki-harmony-700ml",
  },
];

export function buildSearchSuggestions(): SearchSuggestion[] {
  const productSuggestions: SearchSuggestion[] = products.map((product) => {
    const aliases = [
      product.displayName,
      product.query,
      product.brand,
      product.name,
      product.volume,
      ...product.searchTerms,
      ...manualAliases
        .filter((alias) => alias.targetType === "product" && alias.targetId === product.slug)
        .flatMap((alias) => [alias.canonical, ...alias.aliases]),
    ];

    return {
      type: "product",
      label: product.displayName,
      value: product.query,
      slug: product.slug,
      brand: product.brand,
      productId: product.id,
      category: product.categorySlug,
      volume: product.volume,
      aliases,
    };
  });
  const brandSuggestions: SearchSuggestion[] = brandLandings.map((brand) => ({
    type: "brand",
    label: `${brand.nameKo} ${brand.nameEn ?? ""}`.trim(),
    value: brand.nameEn ?? brand.nameKo,
    slug: brand.slug,
    aliases: [brand.nameKo, brand.nameEn ?? "", brand.slug],
  }));
  const categorySuggestions: SearchSuggestion[] = categories.map((category) => ({
    type: "category",
    label: category.name,
    value: category.name,
    slug: category.slug,
    category: category.slug,
    aliases: [category.name, category.headline, ...category.keywords],
  }));
  const popularSuggestions: SearchSuggestion[] = featureSearches.map((searchText) => ({
    type: "popular_query",
    label: searchText,
    value: searchText,
    aliases: [searchText],
  }));

  return [...productSuggestions, ...brandSuggestions, ...categorySuggestions, ...popularSuggestions];
}

export function getSearchSuggestions(input: string, limit = 8) {
  const suggestions = buildSearchSuggestions();
  const normalizedInput = normalizeSearchText(input);

  if (normalizedInput.length < 2) {
    return suggestions
      .filter((suggestion) => suggestion.type === "popular_query" || suggestion.type === "brand")
      .slice(0, limit);
  }

  return suggestions
    .map((suggestion) => {
      const haystack = [suggestion.label, suggestion.value, ...(suggestion.aliases ?? [])].map(normalizeSearchText);
      const exact = haystack.some((item) => item === normalizedInput);
      const startsWith = haystack.some((item) => item.startsWith(normalizedInput));
      const includes = haystack.some((item) => item.includes(normalizedInput));

      return {
        suggestion,
        score: exact ? 100 : startsWith ? 70 : includes ? 40 : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.suggestion);
}
