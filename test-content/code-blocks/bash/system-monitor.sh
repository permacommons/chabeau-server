#!/bin/bash

# System monitoring script
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)

if [ "$CPU_USAGE" -gt 80 ]; then
  echo "Warning: High CPU usage - $CPU_USAGE%"
fi

if [ "$MEMORY_USAGE" -gt 80 ]; then
  echo "Warning: High memory usage - $MEMORY_USAGE%"
fi

if [ "$DISK_USAGE" -gt 80 ]; then
  echo "Warning: High disk usage - $DISK_USAGE%"
fi