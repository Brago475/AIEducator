import { useState, useRef } from "react";
import {
  X, Plus, Search, ChevronLeft, CheckCircle,
  Code2, Globe, BarChart2, Cloud, Lock,
  TrendingUp, PenTool, Microscope, MessageSquare, Users,
  Cpu, DollarSign, Heart, Brain, Feather,
} from "lucide-react";
import { SKILL_CATEGORIES, ALL_PRESET_SKILLS } from "../data/profileData";
import { getSkillIconUrl } from "../data/skillIcons";

interface SkillPickerProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  compact?: boolean;
}

// ─── Brand logo (Simple Icons CDN) ───────────────────────────────────────────

function SkillLogo({ skill, isSelected }: { skill: string; isSelected: boolean }) {
  const url = getSkillIconUrl(skill);
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      aria-hidden="true"
      className={[
        "w-3.5 h-3.5 shrink-0 object-contain flex-none",
        // On selected (blue bg) → white icon
        // On light bg  → dark icon at 85% opacity (clear contrast)
        // On dark bg   → invert to white at 85% opacity
        isSelected
          ? "brightness-0 invert"
          : "opacity-85 dark:invert dark:opacity-85",
      ].join(" ")}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}

// ─── Category Lucide icon ─────────────────────────────────────────────────────

function CategoryIcon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  switch (name) {
    case "Programming":      return <Code2      className={className} />;
    case "Web & Mobile":     return <Globe      className={className} />;
    case "Data & AI":        return <BarChart2  className={className} />;
    case "Cloud & DevOps":   return <Cloud      className={className} />;
    case "Security":         return <Lock       className={className} />;
    case "Engineering":      return <Cpu        className={className} />;
    case "Business":         return <TrendingUp className={className} />;
    case "Finance":          return <DollarSign className={className} />;
    case "Design":           return <PenTool    className={className} />;
    case "Health & Medicine":return <Heart      className={className} />;
    case "Social Sciences":  return <Brain      className={className} />;
    case "Science & Math":   return <Microscope className={className} />;
    case "Arts & Humanities":return <Feather    className={className} />;
    case "Communication":    return <MessageSquare className={className} />;
    case "Soft Skills":      return <Users      className={className} />;
    default:                 return <Code2      className={className} />;
  }
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat, selectedCount, onClick,
}: { cat: (typeof SKILL_CATEGORIES)[0]; selectedCount: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left rounded-xl border p-4 transition-all
        bg-white dark:bg-gray-900
        hover:border-blue-500 dark:hover:border-blue-400
        hover:shadow-sm
        ${selectedCount > 0
          ? "border-blue-500 dark:border-blue-400 ring-1 ring-blue-300 dark:ring-blue-700"
          : "border-gray-300 dark:border-gray-700"
        }`}
    >
      {selectedCount > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold flex items-center justify-center shadow">
          {selectedCount}
        </span>
      )}
      <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-3
        ${selectedCount > 0
          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        }`}>
        <CategoryIcon name={cat.name} className="w-4 h-4" />
      </div>
      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">{cat.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.skills.length} skills</p>
    </button>
  );
}

// ─── Skill toggle button ──────────────────────────────────────────────────────

function SkillButton({
  skill, isSelected, onToggle,
}: { skill: string; isSelected: boolean; onToggle: () => void }) {
  const hasLogo = !!getSkillIconUrl(skill);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left w-full",
        isSelected
          // Selected: solid blue — high contrast white text
          ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white shadow-sm"
          // Unselected: white/dark card with clearly visible border + dark text
          : "bg-white dark:bg-gray-850 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800",
      ].join(" ")}
    >
      {isSelected ? (
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
      ) : hasLogo ? (
        <SkillLogo skill={skill} isSelected={false} />
      ) : (
        /* dot placeholder so text alignment stays consistent */
        <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
          <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
        </span>
      )}
      <span className="truncate">{skill}</span>
    </button>
  );
}

// ─── Main SkillPicker ─────────────────────────────────────────────────────────

export function SkillPicker({ selected, onChange }: SkillPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [customInput, setCustomInput]       = useState("");
  const [customError, setCustomError]       = useState("");
  const customInputRef                      = useRef<HTMLInputElement>(null);

  const toggleSkill  = (skill: string) =>
    onChange(selected.includes(skill) ? selected.filter((s) => s !== skill) : [...selected, skill]);

  const removeSkill  = (skill: string) => onChange(selected.filter((s) => s !== skill));

  const addCustomSkill = () => {
    const trimmed    = customInput.trim();
    if (!trimmed) return;
    const normalized = trimmed.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (selected.map((s) => s.toLowerCase()).includes(normalized.toLowerCase())) {
      setCustomError(`"${normalized}" is already in your list.`); return;
    }
    if (trimmed.length > 40) { setCustomError("Max 40 characters."); return; }
    onChange([...selected, normalized]);
    setCustomInput("");
    setCustomError("");
    customInputRef.current?.focus();
  };

  const handleCustomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); }
    if (customError) setCustomError("");
  };

  const presetSelected = selected.filter((s) => ALL_PRESET_SKILLS.includes(s));
  const customSelected = selected.filter((s) => !ALL_PRESET_SKILLS.includes(s));
  const isSearching    = search.trim().length > 0;
  const searchResults  = isSearching
    ? ALL_PRESET_SKILLS.filter((s) => s.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const activeCatDef   = activeCategory
    ? SKILL_CATEGORIES.find((c) => c.name === activeCategory)
    : null;

  return (
    <div className="space-y-5">

      {/* ── Selected chips ── */}
      {selected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Selected ({selected.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presetSelected.map((skill) => (
              <span key={skill}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1
                  bg-blue-50 dark:bg-blue-950
                  text-blue-800 dark:text-blue-200
                  border border-blue-300 dark:border-blue-700
                  rounded-full text-xs font-medium">
                <SkillLogo skill={skill} isSelected={false} />
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}
                  className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 flex items-center justify-center transition-colors ml-0.5"
                  aria-label={`Remove ${skill}`}>
                  <X className="w-2 h-2" />
                </button>
              </span>
            ))}
            {customSelected.map((skill) => (
              <span key={skill}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1
                  bg-gray-100 dark:bg-gray-800
                  text-gray-800 dark:text-gray-200
                  border border-gray-300 dark:border-gray-600
                  rounded-full text-xs font-medium">
                <Plus className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400 shrink-0" />
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}
                  className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-400 hover:text-white flex items-center justify-center transition-colors ml-0.5"
                  aria-label={`Remove ${skill}`}>
                  <X className="w-2 h-2" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (e.target.value.trim()) setActiveCategory(null); }}
          placeholder="Search skills (e.g. Python, Figma, Nursing)"
          className="w-full pl-9 pr-9 py-2.5 text-sm
            border border-gray-300 dark:border-gray-600
            rounded-lg bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-500 dark:placeholder:text-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Search results ── */}
      {isSearching && (
        searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {searchResults.map((skill) => (
              <SkillButton key={skill} skill={skill}
                isSelected={selected.includes(skill)}
                onToggle={() => toggleSkill(skill)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              No match for "{search}"
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add it as a custom skill below ↓
            </p>
          </div>
        )
      )}

      {/* ── Category overview grid ── */}
      {!isSearching && activeCategory === null && (
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
            Browse by category or search above.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SKILL_CATEGORIES.map((cat) => {
              const count = cat.skills.filter((s) => selected.includes(s)).length;
              return (
                <CategoryCard key={cat.name} cat={cat} selectedCount={count}
                  onClick={() => { setActiveCategory(cat.name); setSearch(""); }} />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category detail view ── */}
      {!isSearching && activeCategory && activeCatDef && (
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-4">
            <button type="button" onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-semibold transition-colors">
              <ChevronLeft className="w-4 h-4" />
              All Categories
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <CategoryIcon name={activeCatDef.name} className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              {activeCatDef.name}
              <span className="text-gray-500 dark:text-gray-400 font-normal">
                ({activeCatDef.skills.length} skills)
              </span>
            </span>
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeCatDef.skills.map((skill) => (
              <SkillButton key={skill} skill={skill}
                isSelected={selected.includes(skill)}
                onToggle={() => toggleSkill(skill)} />
            ))}
          </div>

          {/* Selection count */}
          {(() => {
            const count = activeCatDef.skills.filter((s) => selected.includes(s)).length;
            return count > 0 ? (
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-semibold">
                ✓ {count} skill{count !== 1 ? "s" : ""} selected from {activeCatDef.name}
              </p>
            ) : null;
          })()}

          {/* Jump to other categories */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Jump to:</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_CATEGORIES.filter((c) => c.name !== activeCategory).map((cat) => {
                const count = cat.skills.filter((s) => selected.includes(s)).length;
                return (
                  <button key={cat.name} type="button" onClick={() => setActiveCategory(cat.name)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                      border border-gray-300 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      hover:border-blue-500 dark:hover:border-blue-400
                      hover:text-blue-700 dark:hover:text-blue-300
                      bg-white dark:bg-gray-900 transition-colors font-medium">
                    <CategoryIcon name={cat.name} className="w-3 h-3" />
                    {cat.name}
                    {count > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Add custom skill ── */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/60">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          Add a skill not listed above
        </p>
        <div className="flex gap-2">
          <input
            ref={customInputRef}
            type="text"
            value={customInput}
            onChange={(e) => { setCustomInput(e.target.value); setCustomError(""); }}
            onKeyDown={handleCustomKey}
            placeholder="e.g. AutoCAD, Sign Language, Mediation"
            maxLength={40}
            className="flex-1 px-3 py-2 text-sm
              border border-gray-300 dark:border-gray-600
              rounded-lg bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button type="button" onClick={addCustomSkill} disabled={!customInput.trim()}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
              text-sm font-semibold rounded-lg
              hover:bg-gray-700 dark:hover:bg-white
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {customError && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{customError}</p>
        )}
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Press{" "}
          <kbd className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700 dark:text-gray-200">
            Enter
          </kbd>{" "}
          to add quickly.
        </p>
      </div>
    </div>
  );
}
