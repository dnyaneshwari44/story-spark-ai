import { useState } from "react";
import type {
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
  FieldError,
} from "react-hook-form";

interface SSInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T>;
  error?: FieldError;
  autoComplete?: string;
  autoFocus?: boolean;
}

const SSInput = <T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  required,
  icon,
  register,
  validation,
  error,
  autoComplete,
  autoFocus,
}: SSInputProps<T>) => {
  const [showLocalPassword, setShowLocalPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showLocalPassword ? "text" : type;

  return (
    <div className="w-full min-w-0 box-border">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      <div className="relative w-full box-border">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
            <i className={icon} />
          </span>
        )}

        <input
          type={inputType}
          id={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
          {...register(name, validation)}
          className={`block h-11 w-full max-w-full rounded-xl border bg-transparent text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
            icon ? "pl-11" : "px-4"
          } ${isPasswordField ? "pr-11" : "pr-4"} ${
            error
              ? "border-rose-500 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 dark:text-rose-200"
              : "border-slate-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:text-gray-200"
          }`}
          style={{ boxSizing: "border-box" }}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowLocalPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
            aria-label={showLocalPassword ? "Hide password" : "Show password"}
          >
            <i className={showLocalPassword ? "fi fi-rr-eye" : "fi fi-rr-eye-crossed"} />
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default SSInput;
