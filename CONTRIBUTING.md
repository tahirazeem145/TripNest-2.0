# Contributing to TripNest 2.0

Thank you for your interest in contributing to **TripNest 2.0**! We welcome contributions from the community to help make travel sharing seamless, engaging, and accessible.

---

## Code of Conduct

Please be respectful, collaborative, and constructive when opening issues, reviewing pull requests, and discussing features.

---

## Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/tahirazeem145/TripNest-2.0.git
cd "TripNest 2.0"
```

### 2. Branch Naming Conventions
- `feat/<feature-name>`: For new features
- `fix/<bug-name>`: For bug fixes
- `docs/<doc-name>`: For documentation additions or updates
- `refactor/<name>`: For code refactoring without behavior changes

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Backend Setup
```bash
cd backend
mvn clean spring-boot:run
```

---

## Commit Guidelines

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` introduces a new feature
- `fix:` patches a bug
- `docs:` documentation only changes
- `style:` changes that do not affect the meaning of the code
- `refactor:` a code change that neither fixes a bug nor adds a feature
- `perf:` a code change that improves performance
- `test:` adding missing tests or correcting existing tests
- `chore:` changes to the build process or auxiliary tools

---

## Pull Request Process

1. Ensure your code builds locally without errors (`npm run build` and `mvn compile`).
2. Provide a clear PR title and description outlining what was changed and why.
3. Link relevant issues where applicable.
