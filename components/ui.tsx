import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium leading-[18px] text-stone">{label}</span>
      {hint ? <span className="mt-1 block text-[14px] leading-5 text-stone/80">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[17px] leading-[26px] text-ink outline-none transition-shadow placeholder:text-stone/45 focus:border-pine focus:ring-[3px] focus:ring-pine/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-[140px] resize-y ${props.className ?? ""}`} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "secondary";
}) {
  const styles = {
    primary:
      "h-12 rounded-xl bg-pine px-5 text-[16px] font-medium text-white disabled:cursor-not-allowed disabled:bg-pine/35",
    secondary:
      "h-12 rounded-xl border border-line bg-card px-5 text-[16px] font-medium text-ink hover:bg-pine-soft/60",
    ghost: "h-12 rounded-xl px-3 text-[16px] font-medium text-stone hover:text-ink",
  };
  return <button {...props} className={`${styles[variant]} ${className}`} />;
}

export function ChoiceCard({
  title,
  description,
  selected,
  disabled,
  onSelect,
}: {
  title: string;
  description?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`w-full rounded-[16px] border px-4 py-3.5 text-left transition-colors ${
        selected ? "border-pine bg-pine-soft" : "border-line bg-card hover:border-pine/40"
      } ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <span className="block text-[16px] font-medium leading-6 text-ink">{title}</span>
      {description ? <span className="mt-1 block text-[14px] leading-5 text-stone">{description}</span> : null}
    </button>
  );
}

export function Alert({
  tone,
  children,
}: {
  tone: "info" | "warn" | "stop" | "ok";
  children: ReactNode;
}) {
  const map = {
    info: "bg-[#e8eef5] text-klint",
    warn: "bg-warn-bg text-warn",
    stop: "bg-stop-bg text-stop",
    ok: "bg-ok-bg text-ok",
  };
  return <div className={`rounded-[14px] px-4 py-3 text-[15px] leading-6 ${map[tone]}`}>{children}</div>;
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[16px] leading-6 text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 rounded border-line accent-pine"
      />
      <span>{children}</span>
    </label>
  );
}
