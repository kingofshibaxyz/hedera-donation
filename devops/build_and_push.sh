#!/bin/bash

# Configuration
DOCKER_USERNAME="duysy123"
API_IMAGE_NAME="hedera_hackathon_api"
WORKER_IMAGE_NAME="hedera_hackathon_worker"
UI_IMAGE_NAME="hedera_hackathon_ui"
VERSION="latest"

# Paths to the projects
API_PATH="../backend/hedera_donation"
WORKER_PATH="../smart-contract"
UI_PATH="../frontend"

# Function to build and push multi-architecture Docker images
build_and_push_multi_arch_image() {
    local image_name=$1
    local image_path=$2
    local full_image_name="${DOCKER_USERNAME}/${image_name}:${VERSION}"

    echo "Building multi-arch image: $full_image_name from $image_path..."
    docker buildx build --platform linux/amd64,linux/arm64 \
        -t "$full_image_name" \
        --push "$image_path" || { echo "Failed to build and push $image_name"; exit 1; }
}

# Login to Docker Hub
echo "Logging in to Docker Hub..."
docker login || { echo "Docker login failed. Exiting..."; exit 1; }

# Enable Buildx
echo "Ensuring Docker Buildx is set up..."
docker buildx create --use --name multiarch-builder || docker buildx use multiarch-builder
docker buildx inspect --bootstrap

# Build and push images
build_and_push_multi_arch_image "$API_IMAGE_NAME" "$API_PATH"
build_and_push_multi_arch_image "$WORKER_IMAGE_NAME" "$WORKER_PATH"
build_and_push_multi_arch_image "$UI_IMAGE_NAME" "$UI_PATH"

echo "All multi-architecture images built and pushed successfully!"
