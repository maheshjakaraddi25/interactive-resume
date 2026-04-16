# Professional Experience: Daimler Truck Innovation Center India

## Role: Cloud and DevOps Engineer
**Duration:** February 2023 – December 2025
**Location:** Bangalore, India
**Company:** Daimler Truck Innovation Center India Pvt Ltd

---

## Cloud Migration & Platform Modernisation

### The Kubernetes Migration
This was one of my biggest projects at Daimler. We had a production platform running on traditional VM-based architecture — it was stable but scaling was painful and uptime was sitting at around 85%, which wasn't acceptable for an enterprise platform used by thousands of engineers globally.

I was part of the team that executed a live migration to containerised Kubernetes. The word "live" is important — we couldn't just take everything down. We had to migrate incrementally, validate each service, and ensure zero data loss throughout.

The outcome: platform uptime went from 85% to 99.9%. That's not just a metric — it meant our engineering teams globally stopped experiencing disruptions during critical work.

### Azure Cloud Migration
Beyond Kubernetes, I executed cloud migrations for 5+ enterprise applications to Azure. This included:
- Azure Kubernetes Service (AKS) for containerised workloads
- Azure VMs for legacy services that weren't containerised yet
- Azure App Services for web-facing components
- Azure Application Gateway and DNS for routing

The goal was always scalability and resilience — not just lifting and shifting, but modernising how services are deployed and operated.

### Helm Charts
I authored and integrated custom Helm charts for our enterprise applications. Helm was critical for packaging Kubernetes workloads in a way that was reusable across environments (dev, staging, prod) without configuration drift. This standardised our deployment lifecycle significantly.

---

## Infrastructure as Code & Automation

### Terraform IaC Modules
This is probably where I spent most of my time and had the most impact. I wrote Terraform modules to automate provisioning of both Azure and AWS resources:
- **Azure:** AKS, VMs, App Services, Application Gateway, DNS zones, networking
- **AWS:** EC2 instances, VPCs, IAM policies, S3 buckets

The key was making these reusable — not just scripts that work once, but modular Terraform that could be composed to provision any environment. This improved our infrastructure deployment speed by 70%.

The way I structured it: we had a core module library, then environment-specific configurations that composed those modules with appropriate values. Staging gets smaller instance types and fewer replicas; production gets auto-scaling and multi-AZ.

### Automated Nginx Routing
I designed and implemented a fully automated Nginx server setup that routes traffic for all our platform applications. This was done using Terraform and Ansible playbooks — Terraform provisions the infrastructure, Ansible handles the configuration management. Previously this was done manually, which meant configuration drift and slow environment setup. After automation, spinning up a new environment went from hours to minutes.

---

## CI/CD & Developer Experience

### Pipeline Design
I designed and implemented our CI/CD workflows end-to-end. The pipeline covered:
- Code commit triggers (GitHub webhooks)
- Build and test stages
- Container image building and pushing to registry (Artifactory)
- Automated deployment to dev → staging → production with approval gates at each stage
- Rollback mechanisms when something goes wrong

The tools: Jenkins for orchestration, Helm for Kubernetes deployments, Artifactory for artifact management.

### Microservice Backend
I engineered microservice-based backend services that supported 15,000+ internal users across multiple enterprise applications. These weren't simple CRUD apps — they were developer-facing platform services that other engineering teams depended on for their own CI/CD and tooling.

I also built REST APIs that supported CI/CD tooling and developer platforms — basically internal APIs that let teams interact with the platform programmatically.

### Scale
The infrastructure I maintained supported thousands of concurrent users across global engineering teams (India, Germany, and other Daimler locations). Reliability and performance at that scale required thoughtful capacity planning and monitoring.

---

## Kubernetes, Security & Observability

### Kubernetes Cluster Management
I managed the Kubernetes clusters day-to-day:
- Namespace configuration and resource quotas (ensuring teams couldn't inadvertently consume shared cluster resources)
- RBAC (Role-Based Access Control) — defining who can do what in the cluster
- Security patch management — keeping nodes and control plane components patched without downtime
- Zero-downtime deployments using rolling update strategies

### Azure Networking
I configured and maintained Azure Application Gateway (layer 7 load balancing with SSL termination), DNS zones, and network routing for all cloud-hosted services. Getting networking right is underrated — bad routing configs cause outages that are hard to debug.

### Observability Stack
I set up the monitoring infrastructure using Prometheus and Grafana:
- Prometheus scraped metrics from all services and Kubernetes components
- Grafana dashboards for visualising platform health, resource utilisation, and application performance
- Alerting rules so we caught issues before users noticed them

This was instrumental in maintaining our 99.9% uptime — you can't maintain reliability without visibility.

### NLU Chatbot Integration
I integrated an NLU-powered chatbot into our developer platform. This gave engineers a conversational interface for common platform tasks — querying deployment status, triggering pipelines, checking service health. It's actually what gave me hands-on experience with AI integration at the platform level, which directly informs what I'm building now.

---

## Team & Environment
- Worked within a global engineering organisation at Daimler Truck
- Collaborated with teams across India, Germany, and the US
- Participated in code reviews, architecture discussions, and cross-team planning
- The culture was engineering-rigorous — production incidents were treated seriously and processes were documented
