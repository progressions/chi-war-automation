# Joining Hatch: Building the Data Bridge for AI-Powered Customer Conversations

*December 5, 2025*

I recently started a new role at [Hatch](https://www.usehatchapp.com), an AI CSR (Customer Service Representative) platform that helps home service businesses manage customer conversations at scale. I'm on the Data Bridge team, which handles the integrations that make the platform work.

## What Hatch Does

Hatch provides AI agents that handle customer interactions across SMS, email, and voice calls. The target market is home service businesses: HVAC companies, plumbers, roofers, electricians, and similar trades. These businesses face a common problem: leads come in faster than human CSRs can respond to them. A missed call or a slow text reply means lost revenue.

The AI agents handle the initial conversations: qualifying leads, answering common questions, booking appointments on the calendar. When a conversation needs human attention, it transfers seamlessly. The business gets faster response times and higher conversion rates; human CSRs get to focus on complex interactions instead of repetitive qualification calls.

The numbers are substantial. Hatch has driven over $5.1 billion in revenue for customers. The platform serves more than 2,000 businesses, with customers reporting significantly higher booking and close rates compared to traditional CSR workflows.

## The Data Bridge Team

My team manages the integrations that connect Hatch to external systems. The two primary ones are:

**[ServiceTitan](https://www.usehatchapp.com/integrations/servicetitan)** - The dominant field service management platform in the home services industry. Our integration syncs contact data bidirectionally every 15 minutes and pushes Hatch events back to ServiceTitan in real-time. This powers features like AI calendar booking, where the bot can check availability and actually schedule appointments on the customer's ServiceTitan calendar.

**[Prismatic](https://prismatic.io/customers/hatch/)** - An embedded integration platform that powers our self-service integration marketplace. Before Prismatic, the engineering team spent 30-40% of capacity building bespoke integrations for each customer's specific CRM configuration. Now customers configure their own integrations during onboarding.

The ServiceTitan integration is particularly interesting because it's a full native integration built with Elixir, using ServiceTitan's V2 APIs. Most competitors rely on middleware like Zapier for ServiceTitan connectivity. The direct integration means faster syncs and more reliable data flow.

## Why Integrations Matter for AI CSRs

An AI agent is only as useful as the data it has access to. When a customer texts "I need my AC fixed," the agent needs to know:

- Is this an existing customer? What's their service history?
- What's their address and contact information?
- What appointment slots are available this week?
- Does this customer have an outstanding estimate they might want to approve?

Without integrations, the AI can only have generic conversations. With integrations, it can pull customer records from ServiceTitan, check the calendar, and book an appointment without any human involvement. That's the difference between an interesting demo and a tool that actually saves labor hours.

The Prismatic integration marketplace has reduced onboarding time by 10 days and cut support tickets by 25%. Customers can connect their existing systems themselves instead of waiting for custom development work.

## What I'm Working On

The Data Bridge team maintains these integration pipelines and builds new ones. Home service businesses use dozens of different CRMs, lead sources, and scheduling tools. Each new integration expands the market of businesses that can use Hatch effectively.

I'm also working on improving the reliability and observability of existing integrations. When a sync fails or data doesn't flow correctly, customers notice immediately because their AI agents start giving wrong information. The integration layer is invisible when it works and extremely visible when it doesn't.

## The Broader Context

The AI CSR space is moving quickly. Hatch recently [announced an integration with Yelp](https://www.prnewswire.com/news-releases/hatch-announces-integration-with-yelp-to-help-home-service-businesses-convert-more-leads-and-strengthen-customer-loyalty-302619273.html) to capture high-intent leads. Voice AI capabilities continue to improve, with outbound calling functionality coming soon. The platform is expanding beyond home services into healthcare, dental, and financial services.

The interesting technical challenge is that each vertical has its own ecosystem of specialized software. Healthcare practices don't use ServiceTitan; they use systems like Dentrix or OpenDental. Expanding into new markets means building new integration connectors while maintaining the ones that already exist.

I'm looking forward to working on these problems. The combination of AI conversation systems and data integration pipelines is a compelling technical space, and the impact on small businesses is tangible.

---

*More about Hatch at [usehatchapp.com](https://www.usehatchapp.com)*
