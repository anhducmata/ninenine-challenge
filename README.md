# NineNine Code Challenge

This repository contains my solutions for a comprehensive coding challenge consisting of three main problems covering algorithms, backend development, and system architecture.

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

A full-featured TypeScript Express.js server implementing complete user management:
- ✅ Full CRUD operations with proper HTTP methods
- ✅ SQLite database with custom query implementation
- ✅ Comprehensive input validation and error handling
- ✅ Swagger API documentation
- ✅ MVC architecture pattern
- ✅ 100% test coverage with Jest
- ✅ TypeScript with strict typing throughout

### Run Problem 5
```bash
cd problem5
npm run build
npm start
```

The server will start on `http://localhost:3000` with Swagger docs available at `http://localhost:3000/api-docs`.

## 🏗️ Problem 6: Live Scoreboard System Architecture

A system architecture design for a real-time scoreboard with basic security and scalability considerations:

- **API Design**: REST endpoints for score management
- **Real-time Updates**: WebSocket integration for live updates
- **Authentication**: JWT-based user authentication
- **Database**: PostgreSQL schema design
- **Caching**: Basic Redis implementation for performance
- **Documentation**: Key architectural decisions and rationale

### Core Features
- User authentication and session management
- Score submission and validation
- Real-time leaderboard updates
- Basic rate limiting and security measures

### Documentation
```bash
cd problem6
# View main specification
cat README.md

# Review key decisions
cat ADR/README.md
```

**Key Files**:
- `README.md` - System design and implementation approach
- `ADR/README.md` - Key architectural decisions summary

## 📖 Documentation

Each problem includes detailed setup and implementation notes:
- **Problem 4**: `problem4/README.MD` - Algorithm analysis and performance testing
- **Problem 5**: `problem5/README.MD` - Express.js server implementation details  
- **Problem 6**: `problem6/README.md` - System architecture and design decisions

## 🧪 Testing

```bash
# Run tests (if available)
npm test
```

## 💭 Implementation Notes

### Development Approach
- **Problem 4**: Started with the obvious loop solution, then researched the mathematical formula. The recursive approach was added to demonstrate understanding of different algorithmic paradigms and their trade-offs.
- **Problem 5**: Built incrementally - started with basic CRUD, then added validation, error handling, and comprehensive testing. Focused on TypeScript best practices and clean architecture.
- **Problem 6**: Approached as a system design exercise, focusing on real-world scalability and security concerns rather than just basic functionality.

### Key Learning Points
- Performance implications of different algorithmic approaches
- Importance of comprehensive testing in production-ready code
- Trade-offs in system architecture decisions
- Security considerations in real-time applications
