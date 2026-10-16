"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  EMPTY_INQUIRY,
  INTERESTS,
  buildMailto,
  buildPayload,
  interestFromQuery,
  validateInquiry,
  type InquiryErrors,
  type InquiryFields,
  type InterestId,
} from "@/lib/inquiry";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const INPUT =
  "w-full rounded-sm border border-line bg-bg/70 px-4 py-3 text-ink placeholder:text-muted/60 transition-colors hover:border-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-red-400/70";

type Status = "idle" | "sending" | "success" | "error";
type Props = { accessKey: string; email: string };
const FIELD_ORDER = ["name", "company", "email", "interest"] as const;

function Field({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function InquiryFormInner({ accessKey, email, initialInterest }: Props & { initialInterest: InterestId | "" }) {
  const [fields, setFields] = useState<InquiryFields>({ ...EMPTY_INQUIRY, interest: initialInterest });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Marks the form as interactive (tests wait for this before typing).
  useEffect(() => {
    formRef.current?.setAttribute("data-hydrated", "");
  }, []);

  // A tier link changed ?interest= while the form is open: update that field only,
  // keeping whatever the visitor already typed.
  const [syncedInterest, setSyncedInterest] = useState(initialInterest);
  if (initialInterest !== syncedInterest) {
    setSyncedInterest(initialInterest);
    if (initialInterest) setFields((current) => ({ ...current, interest: initialInterest }));
  }

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const update =
    (name: keyof InquiryFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFields((current) => ({ ...current, [name]: value }));
      setErrors((current) => ({ ...current, [name]: undefined }));
    };

  const describedBy = (key: keyof InquiryErrors) => (errors[key] ? `${key}-error` : undefined);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateInquiry(fields);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if (fields.botcheck) {
      setStatus("success");
      return;
    }
    if (!accessKey) {
      window.location.href = buildMailto(email, fields);
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildPayload(fields, accessKey)),
      });
      const data = (await response.json()) as { success?: boolean };
      setStatus(response.ok && data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="flex h-full flex-col justify-center rounded-sm border border-accent/60 bg-bg/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">✓ Sent</p>
        <p className="mt-2 font-display text-4xl font-extrabold uppercase">Thanks — message received.</p>
        <p className="mt-2 text-muted">We&apos;ll reply within 2 business days from {email}.</p>
      </div>
    );
  }

  return (
    // action/method make the form work even before JavaScript loads (posting straight to
    // Web3Forms, or to the visitor's email app without a key) instead of a GET that would put
    // their details in the URL. Once hydrated, onSubmit takes over.
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      action={accessKey ? WEB3FORMS_ENDPOINT : `mailto:${email}`}
      method="post"
      encType={accessKey ? undefined : "text/plain"}
      className="grid gap-5 sm:grid-cols-2"
    >
      {accessKey && (
        <>
          <input type="hidden" name="access_key" value={accessKey} />
          <input type="hidden" name="subject" value="Baja sponsor inquiry" />
          <input type="hidden" name="from_name" value="tamubaja.com" />
        </>
      )}
      <Field id="name" label="Your name" error={errors.name}>
        <input id="name" name="name" autoComplete="name" placeholder="Jordan Smith" value={fields.name} onChange={update("name")} aria-invalid={!!errors.name} aria-describedby={describedBy("name")} className={INPUT} />
      </Field>
      <Field id="company" label="Company or organization" error={errors.company}>
        <input id="company" name="company" autoComplete="organization" placeholder="Acme Gear" value={fields.company} onChange={update("company")} aria-invalid={!!errors.company} aria-describedby={describedBy("company")} className={INPUT} />
      </Field>
      <Field id="email" label="Work email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={fields.email} onChange={update("email")} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} className={INPUT} />
      </Field>
      <Field id="interest" label="What are you interested in?" error={errors.interest}>
        <select id="interest" name="interest" value={fields.interest} onChange={update("interest")} aria-invalid={!!errors.interest} aria-describedby={describedBy("interest")} className={`${INPUT} select-chevron`}>
          <option value="" disabled>
            Choose one…
          </option>
          {INTERESTS.map((interest) => (
            <option key={interest.id} value={interest.id}>
              {interest.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="message" label="Message (optional)" className="sm:col-span-2">
        <textarea id="message" name="message" rows={5} placeholder="Tell us about your goals: brand visibility, recruiting, parts or services you could provide…" value={fields.message} onChange={update("message")} className={INPUT} />
      </Field>
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        checked={fields.botcheck === "on"}
        onChange={(event) => setFields((current) => ({ ...current, botcheck: event.target.checked ? "on" : "" }))}
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-sm bg-accent px-8 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-bg transition-colors hover:bg-ink disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? "Sending…" : "Send inquiry"}
        </button>
        <p className="text-sm text-muted">
          Prefer email?{" "}
          <a href={`mailto:${email}`} className="text-accent underline underline-offset-2">
            {email}
          </a>
        </p>
      </div>
      <div aria-live="polite" className="sm:col-span-2">
        {status === "error" && (
          <p className="text-sm text-red-300">
            Something went wrong sending your message.{" "}
            <a href={buildMailto(email, fields)} className="font-semibold underline">
              Email it to us instead
            </a>{" "}
            — your details will be filled in.
          </p>
        )}
      </div>
    </form>
  );
}

function InquiryFormFromUrl(props: Props) {
  const params = useSearchParams();
  const initialInterest = interestFromQuery(new URLSearchParams(params.toString()));
  // Bring the form into view whenever a link picks an interest (also covers clicks
  // that happen before the page has finished hydrating).
  useEffect(() => {
    if (initialInterest) document.getElementById("inquire")?.scrollIntoView();
  }, [initialInterest]);
  return <InquiryFormInner {...props} initialInterest={initialInterest} />;
}

export function InquiryForm(props: Props) {
  return (
    <Suspense fallback={<InquiryFormInner {...props} initialInterest="" />}>
      <InquiryFormFromUrl {...props} />
    </Suspense>
  );
}
