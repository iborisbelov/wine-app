#!/usr/bin/env python3
"""
Script to replace old teal colors with new burgundy wine colors
"""

import os
import re

# Color mappings
COLOR_MAP = {
    '#4195af': '#722F37',  # Teal -> Burgundy
    '#4195AF': '#722F37',
    '#357a8f': '#5A2429',  # Dark teal -> Dark burgundy
    '#357A8F': '#5A2429',
    '#2a6273': '#4A1E22',  # Deep teal -> Deep burgundy
    '#2A6273': '#4A1E22',
    '#84BFCF': '#E8D4A8',  # Light teal -> Light champagne
    '#84bfcf': '#E8D4A8',
}

def replace_in_file(filepath):
    """Replace colors in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace all color codes
        for old_color, new_color in COLOR_MAP.items():
            content = content.replace(old_color, new_color)
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Updated: {filepath}")
            return True
        return False
            
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all files"""
    # Directories to process
    dirs_to_process = ['components', 'styles']
    
    # File extensions to process
    extensions = ['.tsx', '.ts', '.css', '.jsx', '.js']
    
    updated_count = 0
    
    for directory in dirs_to_process:
        if not os.path.exists(directory):
            continue
            
        for root, dirs, files in os.walk(directory):
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    filepath = os.path.join(root, file)
                    if replace_in_file(filepath):
                        updated_count += 1
    
    print(f"\n✅ Updated {updated_count} files")

if __name__ == '__main__':
    main()
