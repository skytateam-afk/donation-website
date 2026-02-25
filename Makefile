.PHONY: help install dev build preview clean test

help: ## Show this help message
	@echo 'Frontend Makefile Commands'
	@echo ''
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "📦 Installing frontend dependencies..."
	npm install
	@echo "✅ Dependencies installed"

dev: ## Run development server
	@echo "🚀 Starting frontend dev server..."
	@echo "Frontend: http://localhost:5173"
	npm run dev

build: ## Build for production
	@echo "🔨 Building frontend for production..."
	npm run build
	@echo "✅ Build complete - files in dist/"

preview: ## Preview production build
	@echo "👀 Previewing production build..."
	npm run preview

clean: ## Clean build artifacts
	@echo "🧹 Cleaning..."
	rm -rf node_modules dist .vite
	@echo "✅ Clean complete"

test: ## Run tests
	@echo "🧪 Running tests..."
	npm test

storybook: ## Run Storybook
	@echo "📚 Starting Storybook..."
	npm run storybook
