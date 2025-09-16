FROM golang:1.22 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o auth

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=build /app/auth /app/auth
USER nonroot:nonroot
EXPOSE 9000
ENTRYPOINT ["/app/auth"]
