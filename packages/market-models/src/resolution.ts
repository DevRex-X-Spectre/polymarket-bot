import type {
  EventObservedResolution,
  MarketIdentity,
  MarketTiming,
  ObservedResolution,
  OutcomeIdentity,
} from "./identity.js";

export const RESOLUTION_COMPLETENESS = [
  "sufficient",
  "partial",
  "unknown",
] as const;

export type ResolutionCompleteness = (typeof RESOLUTION_COMPLETENESS)[number];

export const UMA_RESOLVED_STATUSES = ["resolved", "settled"] as const;
export const UMA_UNRESOLVED_STATUSES = [
  "disputed",
  "proposed",
  "requested",
] as const;

export interface ResolutionEvidence {
  readonly fieldPath: string;
  readonly value: string | null;
}

export interface ResolutionExtractionInput {
  readonly identity: MarketIdentity;
  readonly question: string | null;
  readonly description: string | null;
  readonly observedResolution: ObservedResolution;
  readonly outcomes: {
    readonly yes: OutcomeIdentity;
    readonly no: OutcomeIdentity;
  };
  readonly timing: MarketTiming;
  readonly eventObservedResolution?: EventObservedResolution | null;
  readonly extractedAt: string;
}

/**
 * Auditable interpretation of Gamma/SDK resolution fields.
 * Does not parse titles, slugs, or rule text into a reference asset.
 */
export interface MarketResolutionMetadata {
  readonly identity: MarketIdentity;
  readonly statedSource: string | null;
  readonly eventStatedSource: string | null;
  readonly sourceConflict: boolean;
  readonly resolvedBy: string | null;
  readonly questionId: string | null;
  readonly umaResolutionStatus: string | null;
  readonly umaIndicatesResolved: boolean | null;
  readonly observedRuleText: string | null;
  readonly question: string | null;
  readonly yesDeterminedByLabel: string | null;
  readonly noDeterminedByLabel: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly closedTime: string | null;
  readonly referenceAsset: null;
  readonly completeness: ResolutionCompleteness;
  readonly sourceKnown: boolean;
  readonly ruleTextKnown: boolean;
  readonly timingKnown: boolean;
  readonly outcomeSemanticsKnown: boolean;
  readonly evidence: readonly ResolutionEvidence[];
  readonly extractedAt: string;
  readonly notes: string;
}

export function extractMarketResolution(
  input: ResolutionExtractionInput,
): MarketResolutionMetadata {
  const marketSource = emptyToNull(input.observedResolution.source);
  const eventSource = emptyToNull(
    input.eventObservedResolution?.source ?? null,
  );
  const sourceConflict =
    marketSource !== null && eventSource !== null && marketSource !== eventSource;
  const statedSource = sourceConflict
    ? null
    : (marketSource ?? eventSource);
  const observedRuleText = emptyToNull(input.description);
  const yesLabel = emptyToNull(input.outcomes.yes.label);
  const noLabel = emptyToNull(input.outcomes.no.label);
  const umaResolutionStatus = emptyToNull(
    input.observedResolution.umaResolutionStatus,
  );
  const identity = { ...input.identity };

  const sourceKnown = statedSource !== null;
  const ruleTextKnown = observedRuleText !== null;
  const timingKnown = input.timing.endDate !== null;
  const outcomeSemanticsKnown = yesLabel !== null && noLabel !== null;

  let completeness: ResolutionCompleteness = "unknown";
  if (ruleTextKnown && outcomeSemanticsKnown) {
    completeness = "sufficient";
  } else if (
    sourceKnown ||
    ruleTextKnown ||
    timingKnown ||
    yesLabel !== null ||
    noLabel !== null ||
    input.observedResolution.questionId !== null
  ) {
    completeness = "partial";
  }

  const evidence: ResolutionEvidence[] = [
    { fieldPath: "market.resolution.source", value: marketSource },
    { fieldPath: "event.resolution.source", value: eventSource },
    {
      fieldPath: "market.resolution.resolvedBy",
      value: emptyToNull(input.observedResolution.resolvedBy),
    },
    {
      fieldPath: "market.resolution.questionId",
      value: emptyToNull(input.observedResolution.questionId),
    },
    {
      fieldPath: "market.resolution.umaResolutionStatus",
      value: umaResolutionStatus,
    },
    { fieldPath: "market.description", value: observedRuleText },
    { fieldPath: "market.question", value: emptyToNull(input.question) },
    { fieldPath: "market.state.startDate", value: input.timing.startDate },
    { fieldPath: "market.state.endDate", value: input.timing.endDate },
    { fieldPath: "market.state.closedTime", value: input.timing.closedTime },
    { fieldPath: "market.outcomes.yes.label", value: yesLabel },
    { fieldPath: "market.outcomes.no.label", value: noLabel },
    {
      fieldPath: "event.description",
      value: emptyToNull(input.eventObservedResolution?.description ?? null),
    },
  ];

  return {
    identity,
    statedSource,
    eventStatedSource: eventSource,
    sourceConflict,
    resolvedBy: emptyToNull(input.observedResolution.resolvedBy),
    questionId: emptyToNull(input.observedResolution.questionId),
    umaResolutionStatus,
    umaIndicatesResolved: classifyUmaResolved(umaResolutionStatus),
    observedRuleText,
    question: emptyToNull(input.question),
    yesDeterminedByLabel: yesLabel,
    noDeterminedByLabel: noLabel,
    startDate: input.timing.startDate,
    endDate: input.timing.endDate,
    closedTime: input.timing.closedTime,
    referenceAsset: null,
    completeness,
    sourceKnown,
    ruleTextKnown,
    timingKnown,
    outcomeSemanticsKnown,
    evidence,
    extractedAt: input.extractedAt,
    notes: buildNotes({
      completeness,
      sourceKnown,
      sourceConflict,
      ruleTextKnown,
      outcomeSemanticsKnown,
      timingKnown,
    }),
  };
}

export function isResolutionValidated(
  metadata: MarketResolutionMetadata,
): boolean {
  return metadata.completeness === "sufficient";
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function classifyUmaResolved(status: string | null): boolean | null {
  if (status === null) {
    return null;
  }
  const normalized = status.toLowerCase();
  if ((UMA_RESOLVED_STATUSES as readonly string[]).includes(normalized)) {
    return true;
  }
  if ((UMA_UNRESOLVED_STATUSES as readonly string[]).includes(normalized)) {
    return false;
  }
  return null;
}

function buildNotes(flags: {
  completeness: ResolutionCompleteness;
  sourceKnown: boolean;
  sourceConflict: boolean;
  ruleTextKnown: boolean;
  outcomeSemanticsKnown: boolean;
  timingKnown: boolean;
}): string {
  if (flags.sourceConflict) {
    return "Market and event stated sources differ. Source remains unknown until reconciled. Rule text was not parsed for a reference asset.";
  }
  if (flags.completeness === "unknown") {
    return "Gamma did not provide a stated resolution source or rule text. Title and slug were not used as substitutes.";
  }
  if (flags.completeness === "partial") {
    return "Some resolution fields are present, but the stated rule text and/or outcome labels are incomplete. Missing parts remain unknown. Title and slug were not used as substitutes.";
  }
  const extras = [
    flags.sourceKnown ? "stated source present" : "stated source unknown",
    flags.timingKnown ? "end date present" : "end date unknown",
    flags.outcomeSemanticsKnown
      ? "YES/NO labels present"
      : "YES/NO labels unknown",
  ];
  return `Stated rule text is present (${extras.join("; ")}). Rule text was not parsed into a reference asset.`;
}
