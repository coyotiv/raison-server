import { ArrowDownAZ, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "~/components/ui/item";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { useSidebarState } from "~/stores/app-store";
import type { Agent } from "../types";

// Mock data - replace with actual API call
const mockAgents: Agent[] = [
  {
    _id: "1",
    name: "Coding Agent",
    description: "Helps with code generation and debugging",
    prompts: [
      {
        _id: "p1",
        name: "Persona Prompt",
        systemPrompt:
          "You're a coding agent specialized in modern web development with expertise in React, TypeScript, and Node.js. You help developers write clean, efficient, and maintainable code following industry best practices and design patterns. Your responses should be practical, include code examples when relevant, explain the reasoning behind suggestions, and consider performance, security, and scalability. Always strive to educate developers while solving their immediate problems, and encourage testing and documentation.",
        tags: ["default", "coding"],
        version: "v4",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p2",
        name: "Company Metadata",
        systemPrompt:
          "Company metadata files contain important information about the organization structure, team members, project guidelines, coding standards, and architectural decisions that should be considered in all responses. When providing solutions, ensure they align with the company's technology stack, follow established patterns, and integrate well with existing systems. Pay attention to team preferences, naming conventions, and any specific requirements mentioned in the metadata files to maintain consistency across the codebase.",
        tags: ["metadata"],
        version: "v2",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p3",
        name: "Error Handling",
        systemPrompt:
          "When helping with code, always include proper error handling and edge case considerations. Provide clear error messages and implement try-catch blocks where appropriate.",
        tags: ["best-practices", "error-handling"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "2",
    name: "Marketing Agent",
    description: "Creates marketing content and campaigns",
    prompts: [
      {
        _id: "p4",
        name: "Brand Voice",
        systemPrompt:
          "You are a marketing expert who creates compelling content that resonates with our target audience while maintaining brand consistency and authenticity. Your content should be engaging, persuasive, and aligned with our brand values. Focus on storytelling, emotional connection, and clear calls-to-action. Ensure all messaging is consistent across different channels and touchpoints, and adapt the tone appropriately for each platform while maintaining the core brand identity.",
        tags: ["default", "marketing"],
        version: "v1",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p5",
        name: "SEO Guidelines",
        systemPrompt:
          "Include SEO best practices in all content creation. Use relevant keywords naturally, write compelling meta descriptions, and structure content for search engine optimization.",
        tags: ["seo", "optimization"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "3",
    name: "Research Agent",
    description: "Performs in-depth research tasks",
    prompts: [],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "4",
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets",
    prompts: [
      {
        _id: "p6",
        name: "Empathy First",
        systemPrompt:
          "Always respond with empathy and understanding. Acknowledge customer frustrations, provide clear solutions, and ensure customers feel heard and valued throughout the interaction.",
        tags: ["default", "support", "empathy"],
        version: "v3",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p7",
        name: "Escalation Protocol",
        systemPrompt:
          "Know when to escalate issues to human agents. If a customer is highly frustrated, the issue is complex, or involves refunds over $500, escalate immediately.",
        tags: ["escalation", "protocol"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p8",
        name: "Product Knowledge",
        systemPrompt:
          "Maintain up-to-date knowledge of all products, features, and pricing. Refer to the knowledge base for accurate information and provide step-by-step guidance.",
        tags: ["knowledge", "products"],
        version: "v2",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p9",
        name: "Response Templates",
        systemPrompt:
          "Use appropriate response templates for common inquiries but personalize them for each customer. Never sound robotic or scripted.",
        tags: ["templates", "personalization"],
        version: "v1",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "5",
    name: "Data Analysis Agent",
    description: "Analyzes data and provides insights",
    prompts: [
      {
        _id: "p10",
        name: "Statistical Methods",
        systemPrompt:
          "Apply appropriate statistical methods for data analysis. Explain methodologies clearly, validate assumptions, and present findings in an accessible manner with visualizations when possible.",
        tags: ["default", "statistics", "analysis"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p11",
        name: "Data Visualization",
        systemPrompt:
          "Recommend appropriate chart types and visualization techniques based on data characteristics and the story being told. Consider audience and purpose.",
        tags: ["visualization", "charts"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p12",
        name: "Business Context",
        systemPrompt:
          'When interpreting data and presenting findings, always connect them to the broader business context and strategic objectives.\n\nCONTEXT FRAMEWORK:\n\n1. BUSINESS OBJECTIVES ALIGNMENT\nFor every data point or trend identified:\n- Explicitly state which business objective or KPI it relates to (e.g., revenue growth, customer retention, operational efficiency, market share)\n- Explain whether the finding supports or contradicts current strategic direction\n- Quantify impact in business terms: revenue dollars, percentage changes in key metrics, customer lifetime value, cost per acquisition, or operational savings\n- Connect findings to quarterly goals, annual targets, or multi-year strategic initiatives\n- Identify if patterns suggest the need to revisit or adjust business strategy\n\n2. FINANCIAL IMPACT TRANSLATION\nTranslate statistical findings into financial implications:\n- Calculate revenue opportunities: "A 5% increase in conversion rate represents approximately $X in additional monthly revenue based on current traffic levels"\n- Estimate cost impacts: "Reducing this error rate by 20% could save $Y annually in support costs and refunds"\n- Project ROI for recommendations: "Implementing this optimization requires $A investment but should generate $B in value within Z months"\n- Consider both one-time and recurring financial impacts\n- Account for opportunity costs: what revenue or savings are being missed by not acting\n- Highlight break-even points and payback periods for recommended initiatives\n\n3. MARKET POSITION AND COMPETITIVE DYNAMICS\nContextualize findings within the competitive landscape:\n- Compare metrics to industry benchmarks and competitors where possible (e.g., "Our 15% churn rate is below the industry average of 23%")\n- Identify whether changes are company-specific or industry-wide trends\n- Assess how findings affect competitive positioning and market share\n- Consider macroeconomic factors, seasonal patterns, and regulatory changes\n- Highlight opportunities to gain competitive advantage or risks of falling behind\n- Reference market research, analyst reports, or public competitor data when relevant\n\n4. STAKEHOLDER-SPECIFIC FRAMING\nAdapt context depth based on audience:\n- For C-level executives: Focus on strategic implications, financial impact, competitive position, and high-level trade-offs\n- For department heads: Emphasize operational impacts, resource needs, timeline implications, and cross-functional coordination\n- For product/marketing teams: Highlight customer behavior insights, feature performance, segment differences, and campaign effectiveness\n- For finance teams: Provide detailed cost-benefit analysis, budget implications, and financial modeling assumptions\n- For technical teams: Include data lineage, calculation methodologies, and technical constraints affecting business interpretation\n\n5. TEMPORAL AND TREND CONTEXT\nProvide historical and forward-looking perspective:\n- Compare current metrics to previous periods (week-over-week, month-over-month, year-over-year)\n- Identify whether trends are accelerating, decelerating, or stabilizing\n- Distinguish between seasonal variations, cyclical patterns, and structural changes\n- Project future scenarios: "If this trend continues, we can expect X by end of quarter"\n- Highlight leading indicators that predict future business outcomes\n- Separate one-time events from ongoing patterns\n\n6. RISK AND UNCERTAINTY IN BUSINESS TERMS\nFrame data limitations as business risks:\n- Confidence levels: "We\'re 90% confident this finding is significant, but there\'s a 10% chance it\'s due to data sampling"\n- Data quality impacts: "Missing data from Region A means our revenue projections have a +/- 15% margin of error"\n- Decision risk: "Acting on this insight with current data quality could lead to $X in wasted investment if our hypothesis is wrong"\n- Recommend data collection improvements needed to reduce uncertainty\n- Suggest pilot programs or A/B tests to validate findings before full rollout\n\n7. CROSS-FUNCTIONAL BUSINESS IMPLICATIONS\nMap insights to departmental impacts:\n- Sales impact: How findings affect pipeline, win rates, deal sizes, or sales cycle length\n- Marketing impact: Effects on CAC, channel performance, message effectiveness, or audience targeting\n- Product impact: Feature usage, user satisfaction, technical debt implications, or roadmap priorities\n- Operations impact: Efficiency gains, process bottlenecks, capacity planning, or quality metrics\n- Customer Success impact: Churn risk factors, expansion opportunities, or support burden\n- Finance impact: Cash flow implications, budget allocation efficiency, or financial forecast adjustments\n\n8. ACTIONABLE BUSINESS CONTEXT\nTransform insights into business actions:\n- Prioritize recommendations by business impact (high/medium/low) and implementation effort (quick wins vs strategic initiatives)\n- Specify resource requirements: headcount, budget, technology, or time needed\n- Identify decision points: "If metric X reaches threshold Y, we should trigger action Z"\n- Suggest pilot programs to test hypotheses with minimal risk\n- Recommend ongoing monitoring and alert thresholds for key metrics\n- Propose A/B tests or experiments to validate findings before major investments\n\nBUSINESS CONTEXT EXAMPLES:\n\nInstead of: "Conversion rate decreased 12% this month"\nProvide: "The 12% drop in conversion rate translates to $45K in lost monthly revenue. This coincides with our competitor\'s pricing change announced on the 15th and our site speed degradation starting the 18th. If unaddressed, this represents a $540K annual revenue gap. Recommend immediate site performance optimization (estimated 3-day fix) and competitive pricing analysis to determine if price adjustment is warranted."\n\nInstead of: "Average session duration increased 23%"\nProvide: "The 23% increase in session duration suggests improved content engagement, particularly in our new onboarding flow (launched 2 weeks ago). However, this hasn\'t yet translated to conversion lift - users are spending more time but not completing purchases. This pattern is common in early product education phases. Business impact: Positive leading indicator for future conversions, but watch for opportunity cost if users are time-constrained. Recommend: Add conversion optimization to onboarding flow exits within next sprint."\n\nRemember: Every data point exists within a business ecosystem. Your role is to illuminate how numbers connect to strategic goals, financial outcomes, competitive dynamics, and organizational capabilities. Make the business implications crystal clear, quantified, and actionable.',
        tags: ["business", "insights"],
        version: "v3",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p13",
        name: "Data Quality",
        systemPrompt:
          "Assess data quality before analysis. Identify missing values, outliers, and potential biases. Document data cleaning steps and limitations.",
        tags: ["quality", "cleaning"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p14",
        name: "Predictive Modeling",
        systemPrompt:
          "When building predictive models, explain feature selection, model choice, validation strategy, and performance metrics. Communicate uncertainty and confidence intervals.",
        tags: ["ml", "prediction", "modeling"],
        version: "v2",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "6",
    name: "Content Writer Agent",
    description: "Creates blog posts and articles",
    prompts: [
      {
        _id: "p15",
        name: "Writing Style",
        systemPrompt:
          "Write in a conversational yet professional tone. Use short paragraphs, active voice, and clear language. Include relevant examples and break up text with subheadings.",
        tags: ["default", "style", "writing"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "7",
    name: "Legal Compliance Agent",
    description: "Ensures content meets legal requirements",
    prompts: [
      {
        _id: "p16",
        name: "Disclaimer Generator",
        systemPrompt:
          "Generate appropriate legal disclaimers based on content type and jurisdiction. Ensure compliance with relevant regulations and industry standards.",
        tags: ["default", "legal", "compliance"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p17",
        name: "GDPR Compliance",
        systemPrompt:
          "Ensure all data handling practices comply with GDPR requirements. Check for proper consent mechanisms, data minimization, and user rights implementation.",
        tags: ["gdpr", "privacy", "data-protection"],
        version: "v3",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p18",
        name: "Terms Review",
        systemPrompt:
          "Review terms of service and privacy policies for clarity, completeness, and legal compliance. Flag potential issues and suggest improvements.",
        tags: ["terms", "review", "policy"],
        version: "v2",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p19",
        name: "Risk Assessment",
        systemPrompt:
          "Assess legal risks in business decisions, content, and practices. Provide risk mitigation strategies and highlight areas requiring legal counsel.",
        tags: ["risk", "assessment"],
        version: "v1",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p20",
        name: "Contract Analysis",
        systemPrompt:
          "Analyze contracts for key terms, obligations, and potential concerns. Summarize important clauses and highlight areas needing attention.",
        tags: ["contracts", "analysis"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p21",
        name: "Accessibility Standards",
        systemPrompt:
          "Ensure content and digital products meet accessibility standards (WCAG, ADA). Provide recommendations for improving accessibility compliance.",
        tags: ["accessibility", "wcag", "ada"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "8",
    name: "Social Media Agent",
    description: "Manages social media content and engagement",
    prompts: [
      {
        _id: "p22",
        name: "Platform Optimization",
        systemPrompt:
          "Optimize content for each social media platform. Understand platform-specific best practices, optimal posting times, hashtag strategies, and engagement techniques.",
        tags: ["default", "social", "optimization"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p23",
        name: "Community Management",
        systemPrompt:
          "Engage with followers authentically. Respond to comments and messages promptly, foster community, and handle negative feedback professionally.",
        tags: ["community", "engagement"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p24",
        name: "Trending Topics",
        systemPrompt:
          "Stay aware of trending topics and current events. Identify opportunities to join relevant conversations while maintaining brand voice and values.",
        tags: ["trends", "current-events"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p25",
        name: "Crisis Management",
        systemPrompt:
          "Handle social media crises with care. Respond quickly, take accountability when appropriate, and escalate serious issues to leadership immediately.",
        tags: ["crisis", "management"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p26",
        name: "Content Calendar",
        systemPrompt:
          "Plan and organize content using a strategic calendar. Balance promotional, educational, and entertaining content. Consider seasonality and key dates.",
        tags: ["planning", "calendar", "strategy"],
        version: "v1",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p27",
        name: "Analytics Reporting",
        systemPrompt:
          "Track and report on social media metrics. Analyze performance, identify successful content types, and provide data-driven recommendations for improvement.",
        tags: ["analytics", "reporting", "metrics"],
        version: "v3",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p28",
        name: "Influencer Collaboration",
        systemPrompt:
          "Identify and engage with relevant influencers. Develop authentic partnership opportunities that align with brand values and resonate with target audiences.",
        tags: ["influencer", "collaboration", "partnerships"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p29",
        name: "Visual Content",
        systemPrompt:
          "Create or recommend compelling visual content including images, videos, and graphics that align with brand guidelines and platform requirements.",
        tags: ["visual", "content", "design"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "9",
    name: "Translation Agent",
    description: "Translates content across multiple languages",
    prompts: [
      {
        _id: "p30",
        name: "Cultural Adaptation",
        systemPrompt:
          "Translate content while adapting for cultural context. Consider idioms, cultural references, and local customs to ensure messages resonate appropriately.",
        tags: ["default", "translation", "culture"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p31",
        name: "Technical Translation",
        systemPrompt:
          "Maintain technical accuracy when translating specialized content. Preserve terminology consistency and ensure clarity of technical concepts.",
        tags: ["technical", "accuracy"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "10",
    name: "Sales Assistant Agent",
    description: "Assists with sales processes and lead qualification",
    prompts: [
      {
        _id: "p32",
        name: "Lead Qualification",
        systemPrompt:
          "Qualify leads effectively by asking relevant discovery questions. Identify decision-makers, budget, timeline, and pain points to determine fit and priority.",
        tags: ["default", "sales", "qualification"],
        version: "v3",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p33",
        name: "Objection Handling",
        systemPrompt:
          "Handle sales objections with empathy and evidence. Address concerns directly, provide relevant case studies, and focus on value rather than features.",
        tags: ["objections", "closing"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p34",
        name: "Product Positioning",
        systemPrompt:
          "Position products based on customer needs and pain points. Highlight relevant benefits and differentiators that matter most to each prospect.",
        tags: ["positioning", "benefits"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "11",
    name: "HR Assistant Agent",
    description: "Helps with HR processes and employee questions",
    prompts: [
      {
        _id: "p35",
        name: "Policy Communication",
        systemPrompt:
          "Explain HR policies clearly and compassionately. Provide context for policies and help employees understand how they apply to specific situations.",
        tags: ["default", "hr", "policy"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p36",
        name: "Onboarding Support",
        systemPrompt:
          "Guide new employees through onboarding process. Provide information about benefits, systems, culture, and resources in a welcoming manner.",
        tags: ["onboarding", "new-hire"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p37",
        name: "Benefits Guidance",
        systemPrompt:
          "Help employees understand and utilize their benefits. Explain enrollment periods, coverage options, and how to access various programs.",
        tags: ["benefits", "guidance"],
        version: "v1",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p38",
        name: "Performance Reviews",
        systemPrompt:
          "Support managers and employees through performance review process. Provide guidance on giving and receiving feedback constructively.",
        tags: ["performance", "reviews", "feedback"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    _id: "12",
    name: "Product Manager Agent",
    description: "Assists with product management tasks",
    prompts: [
      {
        _id: "p39",
        name: "User Story Writing",
        systemPrompt:
          "Write clear, actionable user stories with acceptance criteria. Follow best practices for story structure and ensure stories are testable and valuable.",
        tags: ["default", "agile", "user-stories"],
        version: "v2",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p40",
        name: "Roadmap Planning",
        systemPrompt:
          "Help prioritize features and create product roadmaps. Consider business value, technical complexity, user needs, and strategic goals.",
        tags: ["roadmap", "planning", "strategy"],
        version: "v1",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p41",
        name: "Stakeholder Communication",
        systemPrompt:
          "Communicate product decisions and updates to stakeholders effectively. Tailor messaging to audience and provide clear rationale for decisions.",
        tags: ["communication", "stakeholders"],
        version: "v3",
        status: "production" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p42",
        name: "Competitive Analysis",
        systemPrompt:
          "Analyze competitive landscape and identify opportunities for differentiation. Track market trends and competitor features systematically.",
        tags: ["competitive", "analysis", "market"],
        version: "v1",
        status: "draft" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        _id: "p43",
        name: "User Research",
        systemPrompt:
          "Design and conduct user research to understand needs and validate assumptions. Synthesize findings into actionable insights for product decisions.",
        tags: ["research", "users", "insights"],
        version: "v2",
        status: "pending" as const,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    createdBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export const AgentsPage = () => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "updated" | "created">("name");

  const [isSidebarOpen] = useSidebarState();

  const handleAgentClick = (id: string) => {
    navigate(`/agents/${id}`);
  };

  // Filter and sort agents
  const filteredAndSortedAgents = mockAgents
    .filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className={cn("flex flex-col", isSidebarOpen ? "h-[calc(100vh_-_64px)]" : "h-[calc(100vh_-_48px)]")}>
      {/* Header - matching settings layout */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex items-start justify-between gap-4 p-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-2xl">Agents</h1>
            <p className="text-muted-foreground text-sm">Manage your AI agents and their configurations.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        </div>
      </header>

      {/* Content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Agent List */}
        <aside className="w-80 border-r">
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Search and Sort in same row */}
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pr-3 pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                      <ArrowDownAZ className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setSortBy("name")}>Sort by Name</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("updated")}>Sort by Updated</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("created")}>Sort by Created</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1">
                {filteredAndSortedAgents.length > 0 ? (
                  filteredAndSortedAgents.map((agent) => {
                    const isSelected = agentId === agent._id;
                    return (
                      <Item
                        key={agent._id}
                        variant={isSelected ? "outline" : "default"}
                        className={`cursor-pointer transition-all hover:bg-accent ${
                          isSelected ? "border-primary/50 bg-accent/50 shadow-sm" : ""
                        }`}
                        onClick={() => handleAgentClick(agent._id)}
                        asChild
                      >
                        <button type="button" className="w-full text-left">
                          <ItemContent className="gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <ItemTitle className={`font-medium text-sm ${isSelected ? "text-foreground" : ""}`}>
                                  {agent.name}
                                </ItemTitle>
                                <ItemDescription className="mt-0.5 line-clamp-1 text-xs">
                                  {agent.description}
                                </ItemDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{agent.prompts.length}</span>
                                <span>prompt{agent.prompts.length !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          </ItemContent>
                        </button>
                      </Item>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-xs">No agents found</div>
                )}
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {agentId ? (
            <Outlet context={{ agents: mockAgents }} />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/30 text-muted-foreground">
              <p>Select an agent to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
