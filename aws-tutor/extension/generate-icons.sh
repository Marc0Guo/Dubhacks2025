#!/bin/bash

# Generate different icon sizes from SVG
# This is a simple script - in production you'd use ImageMagick or similar

echo "Generating icon sizes..."

# For now, we'll create placeholder PNG files
# In a real project, you'd convert the SVG to different sizes

# Create 16x16 icon
echo "Creating 16x16 icon..."
cp icons/icon.svg icons/icon16.png

# Create 32x32 icon  
echo "Creating 32x32 icon..."
cp icons/icon.svg icons/icon32.png

# Create 48x48 icon
echo "Creating 48x48 icon..."
cp icons/icon.svg icons/icon48.png

# Create 128x128 icon
echo "Creating 128x128 icon..."
cp icons/icon.svg icons/icon128.png

echo "Icons generated! (Note: These are SVG files renamed to PNG - in production, convert to actual PNG)"
