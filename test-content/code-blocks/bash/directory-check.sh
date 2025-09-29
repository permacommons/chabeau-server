#!/bin/bash

# Function to check if a directory exists
check_directory() {
  if [ -d "$1" ]; then
    echo "Directory $1 exists"
  else
    echo "Directory $1 does not exist"
  fi
}

# Main script
for dir in "$@"; do
  check_directory "$dir"
done