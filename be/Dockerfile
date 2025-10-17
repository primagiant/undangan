# --- STAGE 1 ---
FROM golang:1.24-alpine AS builder

# Install compiler tools needed for CGO (for SQLite)
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Enable CGO because go-sqlite3 requires it
RUN CGO_ENABLED=1 GOOS=linux go build -a -o /go-server .

# --- STAGE 2 ---
FROM alpine:latest

# Install libc dependency for SQLite
RUN apk add --no-cache libc6-compat

WORKDIR /root/
COPY --from=builder /go-server .

EXPOSE 8081
CMD ["./go-server"]
