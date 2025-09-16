# Build
FROM golang:1.22 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o rp

# Run
FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=build /app/rp /app/rp
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/rp"]
