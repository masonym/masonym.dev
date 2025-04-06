# [mason's maple matrix](https://masonym.dev/)

# MapleStory Tools Platform (mason's maple matrix)

> A full-featured web platform offering advanced tools for players of the MMORPG *MapleStory*, powered by a custom data ingestion pipeline and scalable cloud architecture.

## Overview

This site provides real-time information and simulators for key in-game systems and events in MapleStory. It serves thousands of users monthly and is designed for high performance, fast iteration, and extensibility.

The platform is backed by a custom ETL/data mining pipeline that extracts game data from client files and formats it for display via a dynamic API + frontend system.

## Features

### 🛍️ Upcoming Cash Shop Sales
Preview upcoming cash shop rotations with dynamically updated data mined from game client files. Regularly updated and used by thousands of players -- our top feature!

### 💥 Star Forcing Simulator
Plan equipment enhancement attempts using a probability-based simulator that replicates in-game logic.

### 🔷 Hexa Matrix Calculator
Preview 6th job progression (via Sol Erda costs) all across 50+ classes and simulate expected costs for Hexa Stats.

### 🐲 Boss Data Viewer
Detailed boss breakdowns with HP, level, PDR, required Arcane/Sacred power, and other fight-critical info.

## Architecture

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS  
- **Backend**: AWS API Gateway + Lambda (REST API), serving data from DynamoDB  
- **Assets**: AWS S3 (images, JSON dumps), distributed via CloudFront  
- **Deployment**: Hosted on Cloudflare for caching and DDoS protection  
- **ETL Pipeline**: Custom-built in C# + Python (private repo), mines data from MapleStory client and formats for DynamoDB insertion  

## Planned Features

- 🎨 **Damage Skin Simulator**  
  View and preview every in-game damage skin with live rendering and detailed controls.

## Data Pipeline

The data powering the platform is sourced via a proprietary ETL process:

1. **Client File Mining**  
   Game client files are parsed using a custom [C# tool](https://github.com/masonym/cash-shop-wz-extractor) to extract item metadata, boss stats, skill info, and visual assets.

2. **Transformation Layer**  
   Data is cleaned and normalized using a Python script, and then loaded into DynamoDB in optimized formats.

3. **API Exposure**  
   A RESTful API built on AWS Lambda + API Gateway exposes the data to the frontend.

## Performance

- Built to handle spikes in traffic during patch cycles and new game updates  
- Leverages server-side rendering and CDN-level caching for low-latency load times  
- Designed for maintainability with modular tool architecture and centralized data fetching

## License

Private project. Not open source.
