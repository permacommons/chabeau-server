#!/bin/bash

# Backup script
SOURCE_DIR="/home/user/documents"
BACKUP_DIR="/backup/documents"
DATE=$(date +%Y%m%d)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/$DATE"

# Copy files
rsync -av "$SOURCE_DIR/" "$BACKUP_DIR/$DATE/"

# Remove backups older than 30 days
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} +