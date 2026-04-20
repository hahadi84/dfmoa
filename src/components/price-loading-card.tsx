type PriceLoadingCardProps = {
  title?: string;
  description?: string;
};

export function PriceLoadingCard({
  title = "공개가 확인 중",
  description = "면세점 공개 페이지와 국내가 후보를 차례대로 확인하고 있습니다.",
}: PriceLoadingCardProps) {
  return (
    <div className="price-loading-card" role="status" aria-live="polite">
      <div className="loading-mascot" aria-hidden="true">
        <span className="loading-mascot-ear is-left" />
        <span className="loading-mascot-ear is-right" />
        <span className="loading-mascot-face">
          <span className="loading-mascot-eye is-left" />
          <span className="loading-mascot-eye is-right" />
          <span className="loading-mascot-tag" />
        </span>
      </div>
      <div className="price-loading-copy">
        <strong>{title}</strong>
        <span>{description}</span>
        <span className="price-loading-track" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}
