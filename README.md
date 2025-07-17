# NineNine Code Challenge

This repository contains solutions for a comprehensive coding challenge consisting of three main problems covering algorithms, backend development, and system architecture.

## 📋 Overview

- **Problem 4**: Three different approaches to sum numbers from 1 to n
- **Problem 5**: TypeScript Express.js CRUD server with database persistence
- **Problem 6**: Live Scoreboard System - Complete API module specification and architecture

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- TypeScript
- npm

### Installation
```bash
# Install root dependencies
npm install

# Install Problem 5 dependencies
cd problem5
npm install
cd ..
```

## 📁 Project Structure

```
├── problem4/           # Sum to n implementations
│   ├── main.ts        # Three different approaches
│   └── README.MD      # Problem 4 documentation
├── problem5/           # Express.js CRUD server
│   ├── src/           # TypeScript source code
│   ├── package.json   # Dependencies and scripts
│   └── README.MD      # Problem 5 documentation
├── problem6/           # Live Scoreboard System Architecture
│   ├── README.md      # Complete system specification
│   ├── c4-diagram.md  # System flow diagram
│   ├── full.svg       # Visual system architecture
│   └── ADR/           # Architecture Decision Records
├── package.json       # Root dependencies
└── README.md          # This file
```

## 🔢 Problem 4: Three Ways to Sum to N

Implements three different approaches to calculate the sum of numbers from 1 to n:
1. **Loop-based** approach
2. **Mathematical formula** approach  
3. **Recursive** approach

### Run Problem 4
```bash
cd problem4
tsc main.ts && node main.js
```

Performance comparison shows the mathematical formula is fastest, followed by the loop, with recursion being slowest and having stack overflow issues for large n.

## 🖥️ Problem 5: CRUD Server

A full-featured TypeScript Express.js server with:
- ✅ Complete CRUD operations
- ✅ SQLite database persistence
- ✅ Input validation and error handling
- ✅ Swagger API documentation
- ✅ MVC architecture
- ✅ TypeScript with strict typing

### Run Problem 5
```bash
cd problem5
npm run build
npm start
```

The server will start on `http://localhost:3000` with Swagger docs available at `http://localhost:3000/api-docs`.

## 🏗️ Problem 6: Live Scoreboard System Architecture

A comprehensive system architecture specification for a real-time scoreboard with security and scalability considerations:

- ✅ **Complete API Specification**: Detailed endpoints and data models
- ✅ **Real-time Updates**: WebSocket-based live scoreboard broadcasting
- ✅ **Security Framework**: Cryptographic action proofs and multi-layer validation
- ✅ **Microservices Architecture**: Scalable service-oriented design
- ✅ **Caching Strategy**: Redis-based performance optimization
- ✅ **Rate Limiting**: Multi-tier abuse prevention
- ✅ **Database Design**: PostgreSQL schema with ACID compliance
- ✅ **Architecture Decision Records**: Documented technical decisions

### Key Features
- **Authentication**: JWT-based stateless authentication
- **Score Security**: Cryptographic proof validation to prevent manipulation
- **Performance**: Redis caching with 60-second TTL for leaderboards
- **Real-time**: WebSocket connections for instant score updates
- **Scalability**: Microservices design for independent scaling
- **Monitoring**: Comprehensive observability and alerting

### Documentation Structure
```bash
cd problem6
# View main specification
cat README.md

# Review architecture decisions
ls ADR/
cat ADR/README.md

# See system flow diagram
cat c4-diagram.md
```

**Key Documentation**:
- `README.md` - Complete system specification and implementation guide
- `ADR/` - Architecture Decision Records explaining technical choices
- `c4-diagram.md` - Detailed sequence diagram of system interactions
- `full.svg` - Visual system architecture diagram

## 📖 Detailed Documentation

For detailed setup instructions, API documentation, and implementation details:
- **Problem 4**: See `problem4/README.MD` - Algorithm implementations and performance analysis
- **Problem 5**: See `problem5/README.MD` - Express.js CRUD server with TypeScript
- **Problem 6**: See `problem6/README.md` - Live Scoreboard System architecture specification
  - Architecture Decision Records: `problem6/ADR/README.md`
  - System Flow Diagram: `problem6/c4-diagram.md`
  - Technical Decisions: Individual ADR files in `problem6/ADR/`

## 🧪 Testing

```bash
# Run tests (if available)
npm test
```
