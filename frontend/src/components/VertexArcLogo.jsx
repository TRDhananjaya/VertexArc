import logoMarkLight from "../assets/logo-mark-dark.png";
import logoMarkDark from "../assets/logo-mark.png";

export function VertexArcEmblem({ className = "h-8 w-8", alt = "VertexArc Logo" }) {
  return (
    <div className={`relative shrink-0 inline-flex items-center justify-center ${className}`}>
      {/* Light mode: dark star with purple arrowhead tip */}
      <img
        src={logoMarkLight}
        alt={alt}
        className="h-full w-full object-contain dark:hidden"
      />
      {/* Dark mode: white star with purple arrowhead tip */}
      <img
        src={logoMarkDark}
        alt={alt}
        className="h-full w-full object-contain hidden dark:block"
      />
    </div>
  );
}

export function VertexArcLogo({
  className = "h-8 w-8",
  textClassName = "text-xl font-bold tracking-tight text-gray-950 dark:text-white",
  showText = true,
  badge = null
}) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <VertexArcEmblem className={className} />
      {showText && (
        <span className={textClassName}>
          Vertex<span className="text-violet-600 dark:text-violet-400">Arc</span>
        </span>
      )}
      {badge && (
        <span className="rounded-full bg-violet-100 dark:bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
          {badge}
        </span>
      )}
    </div>
  );
}

export default VertexArcLogo;
