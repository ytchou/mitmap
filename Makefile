.PHONY: dev-all doctor

dev-all:
	pnpm dev

doctor:
	@bash scripts/doctor.sh
