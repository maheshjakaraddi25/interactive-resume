# Project: Load Balancing Algorithm Optimisation

## Overview
**Type:** Systems & Networking / Algorithms
**Focus:** Traffic routing optimisation and adaptive load distribution

---

## What It Is
A project focused on designing and optimising traffic routing algorithms to reduce server bottlenecks and latency. The work involved building monitoring utilities that could dynamically adjust routing decisions based on real-time performance metrics.

## The Problem
Traditional static load balancing (like round-robin) doesn't account for the actual state of backend servers. If one server is under heavy load and another is idle, round-robin still sends equal traffic to both — leading to bottlenecks on the loaded server and underutilisation on the idle one.

## The Approach

### Algorithm Design
The goal was to design an algorithm that factors in real server state when making routing decisions:
- Server CPU and memory utilisation at time of routing decision
- Request queue depth per server
- Historical response time per server (weighted moving average)

The routing decision weights these factors and routes new requests to the server that is most capable of handling them quickly.

### Dynamic Adjustment
The monitoring component continuously samples server metrics and feeds them into the routing algorithm. This creates a feedback loop:
1. Monitor observes server states
2. Algorithm updates routing weights
3. Traffic is redistributed accordingly
4. New server states are observed

This is similar in concept to how Kubernetes uses metrics for pod scheduling, or how cloud load balancers use health checks — but implemented from scratch to understand the fundamentals.

### Results
The optimised algorithm reduced simulated server bottlenecks and improved average latency compared to a static round-robin baseline under uneven load conditions.

## Why This Project Matters
Load balancing is foundational to everything I've done in production at Daimler. Understanding the algorithms — not just using Nginx or Azure Load Balancer as black boxes — gives me a much deeper appreciation for how to configure them correctly and when their defaults will fail. It also directly relates to Kubernetes scheduling, which I manage daily.
