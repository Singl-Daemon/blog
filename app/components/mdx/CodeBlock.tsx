import {
  type HTMLAttributes,
  useId,
} from "react";
import { CodeBlockFrame } from "./CodeBlockFrame";
import { CopyButton } from "./CopyButton";

interface StepAnnotation {
  label: string;
  startLine: number;
  endLine: number;
}

function parseStepAnnotations(meta: string): StepAnnotation[] {
  const annotations: StepAnnotation[] = [];
  for (const match of meta.matchAll(/\{"([^"]+)":\s*(\d+)-(\d+)\}/g)) {
    annotations.push({
      label: match[1],
      startLine: Number.parseInt(match[2], 10),
      endLine: Number.parseInt(match[3], 10),
    });
  }
  return annotations;
}

interface PreProps extends HTMLAttributes<HTMLPreElement> {
  "data-language"?: string;
  "data-theme"?: string;
  "data-meta"?: string;
  dataMeta?: string;
  raw?: string;
}

export function Pre({ children, ...props }: PreProps) {
  const id = useId();
  const lang = props["data-language"] || "";
  const rawMeta = props["data-meta"] || props.dataMeta || "";
  const steps = parseStepAnnotations(rawMeta);

  return (
    <CodeBlockFrame>
      {lang ? <span className="code-lang-badge">{lang}</span> : null}
      <CopyButton targetId={id} />
      <pre id={id} {...props}>
        {children}
      </pre>
      {steps.length > 0 ? (
        <div className="code-steps">
          {steps.map((step) => (
            <div
              key={`${step.label}-${step.startLine}-${step.endLine}`}
              className="code-step-label"
              style={{
                top: `${16 + (step.startLine - 1) * 24.65}px`,
              }}
            >
              {step.label}
            </div>
          ))}
        </div>
      ) : null}
    </CodeBlockFrame>
  );
}
