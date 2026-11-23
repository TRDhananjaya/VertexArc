import logoMark from "../assets/logo-mark.png";

export function VertexArcEmblem({ className = "h-8 w-auto", alt = "VertexArc Logo" }) {
  return (
    <img
      src={logoMark}
      alt={alt}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable="false"
    />
  );
}

export function VertexArcLogo({
  className = "h-7 w-auto",
  textClassName = "text-xl",
  showText = true,
  badge = null
}) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none font-sans">
      <VertexArcEmblem className={className} />
      {showText && (
        <span className={`font-sans font-bold tracking-tight text-gray-950 dark:text-white ${textClassName}`}>
          Vertex<span className="bg-gradient-to-r from-[#3A0CA3] via-[#6d28d9] to-[#7C3AED] bg-clip-text text-transparent">Arc</span>
        </span>
      )}
      {badge && (
        <span className="rounded-full bg-[#3A0CA3]/10 dark:bg-[#3A0CA3]/20 px-2 py-0.5 text-[10px] font-semibold text-[#3A0CA3] dark:text-[#c4b5fd] border border-[#3A0CA3]/25">
          {badge}
        </span>
      )}
    </div>
  );
}

export default VertexArcLogo;
