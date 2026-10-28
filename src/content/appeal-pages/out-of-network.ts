import type { AppealPage } from "./types";

export const outOfNetworkPage: AppealPage = {
  slug: "out-of-network-denial-appeal-letter",
  seoTitle: "Out of Network Claim Appeal Letter (CO-242) | Free Draft",
  metaDescription:
    "Appeal an out-of-network denial: emergency care, no in-network availability, continuity of care and gap exceptions. Free appeal letter draft, no account.",
  h1: "Out of network claim appeal letter",
  eyebrow: "Denial code CO-242",
  intro:
    "Ask for the right thing. Not simply payment - payment at the in-network benefit level, because this episode could not reasonably have happened in network.",
  toolPreset: "out-of-network",
  denialCode: "CO-242",
  denialReasonLabel: "Out of network",
  heroPoints: [
    "Emergency, availability and continuity arguments",
    "Gap exception and single-case agreement requests",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What an out-of-network denial means",
    paragraphs: [
      "CO-242 is described as services not provided by network or primary care providers. The plan is not questioning the care; it is applying a network rule. So the appeal is about whether that rule should govern this episode, and the request is specific.",
      "That phrasing matters. An appeal that asks the plan to pay something invites a small out-of-network payment and a large patient balance. An appeal that asks for in-network benefit processing asks the plan to treat the episode as if the provider were contracted, which is the outcome that protects the patient.",
      "Patient protections for surprise bills, emergency services and certain facility-based care have changed in recent years and depend on the service, the setting and the plan type. Ask the plan in writing which rules it applied, and verify how they apply to your episode before relying on them.",
    ],
  },

  commonCauses: {
    heading: "When an out-of-network claim is worth appealing",
    items: [
      {
        title: "Emergency care",
        body: "The patient could not choose the facility or the clinician, and the presentation required immediate treatment.",
      },
      {
        title: "No in-network provider was available",
        body: "Nobody in network could deliver the service within a reasonable time or distance - the most common argument, and the one most often made without evidence.",
      },
      {
        title: "Continuity of active treatment",
        body: "A course of treatment was already underway and interrupting it would cause harm.",
      },
      {
        title: "The provider was listed as in network",
        body: "A directory error sent the patient to a provider the plan now says is out of network.",
      },
      {
        title: "The plan directed the patient there",
        body: "A referral or authorization pointed to this provider, which is worth attaching verbatim.",
      },
    ],
  },

  strategies: {
    heading: "What can strengthen this appeal",
    items: [
      {
        title: "Turn availability into evidence",
        body: "A statement that nobody was available is an assertion. Four practices, the dates you called, the names you spoke to and the next appointment each offered is evidence. Build that log at referral time, not at appeal time.",
      },
      {
        title: "Say what the patient could not control",
        body: "For emergency and facility-based care, the fact the patient did not and could not choose the clinician is the centre of the argument.",
      },
      {
        title: "Quantify the consequence",
        body: "Processing at the out-of-network level leaves the patient responsible for a specific amount. Name it.",
      },
      {
        title: "Ask for the benefit level, not a payment",
        body: "Request that the claim be processed at the in-network benefit level under the plan's network adequacy provisions.",
      },
      {
        title: "Cover the rest of the episode",
        body: "Ask for a network gap exception or single-case agreement for the remaining course of care, naming the services and timeframe.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    bullets: [
      "The denial letter or EOB showing the network determination",
      "Emergency department, ambulance or admission records where the care was emergent",
      "A documented search for in-network providers: names, dates, wait times and distances",
      "Records showing active treatment already underway with this provider",
      "The referral or authorization that directed the patient to this provider",
      "A dated directory screenshot, where the provider was listed as participating",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Argument section",
    text: "No participating provider was reasonably available to deliver [SERVICE]. Between [DATE] and [DATE] this office contacted [PRACTICE A] on [DATE], [PRACTICE B] on [DATE] and [PRACTICE C] on [DATE]. The earliest appointment offered by any participating provider was [DATE], [NUMBER] weeks after the clinically indicated date, and [PRACTICE] confirmed it is no longer accepting this plan. A log of those contacts is enclosed.\n\nThe patient required [SERVICE] by [CLINICALLY INDICATED DATE] because [CLINICAL REASON AND RISK OF DELAY]. The service was therefore obtained from [PROVIDER NAME], the nearest available provider with the required capability.\n\nI request that the plan process claim [CLAIM NUMBER] at the in-network benefit level under its network adequacy provisions, and approve a network gap exception for the remaining course of treatment.",
    note: "An example of how to present a documented search. It is not a claim about how any particular plan will decide.",
  },

  faqs: [
    {
      question: "What is denial code CO-242?",
      answer:
        "CO-242 means services were not provided by network or primary care providers. It reflects a network rule rather than a clinical judgment, so the appeal argues why the rule should not govern this episode.",
    },
    {
      question: "What is a network gap exception?",
      answer:
        "A plan decision to treat an out-of-network provider as in network for a specific patient and service, because the network cannot deliver the care within a reasonable time or distance. Ask for it by name and attach your availability log.",
    },
    {
      question: "Can I be balance-billed for emergency care?",
      answer:
        "Federal and state protections restrict balance billing in defined situations, particularly emergency services and some out-of-network care delivered at in-network facilities. Whether they reach your episode depends on the service, the setting and the plan type - ask the plan in writing which rules it applied.",
    },
    {
      question: "Does continuity of care really work as an argument?",
      answer:
        "It does when treatment is genuinely underway and switching would cause harm - an active chemotherapy course, a surgical series, a pregnancy already being managed. Give the start date, the plan of care and the specific harm from interruption.",
    },
    {
      question: "Should the provider or the patient appeal?",
      answer:
        "Often both. The provider holds the availability log and the clinical record; the member holds the plan's appeal rights and the route to external review.",
    },
  ],

  related: [
    "prior-authorization-denial-appeal-letter",
    "appeal-letter-for-patients",
    "medical-necessity-appeal-letter",
  ],
};
