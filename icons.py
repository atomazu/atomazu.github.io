import json

def trim_url(url):
    # List of common image file extensions
    extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    
    for ext in extensions:
        # Find the position of the extension in the URL
        pos = url.lower().find(ext)
        if pos != -1:
            # If found, return the URL up to and including the extension
            return url[:pos + len(ext)]
    
    # If no extension is found, return the original URL
    return url

icons = {
    "Item Pool Icons": [
        "Treasure Room", "Shop", "Boss Room", "Devil Room", "Angel Room",
        "Secret Room", "Library", "Golden Chest", "Red Chest"
    ],
    "Health Icons": [
        "Red Heart", "Soul Heart", "Black Heart", "Bone Heart",
        "Coin Heart", "Rotten Heart"
    ],
    "Character Icons": ["Character Icons (for each playable character)"],
    "Completion Mark Icons": [
        "Heart", "Cross", "Inverted Cross", "Polaroid", "Negative",
        "Brimstone", "Star", "Planet", "Knife", "Beast"
    ],
    "Special Icons": [
        "Tainted Character Icon", "Curse Icon", "Key Icon",
        "Checkmark Icon", "Lock Icon"
    ],
    "Difficulty Icons": [
        "Normal Mode", "Hard Mode", "Greed Mode", "Greedier Mode"
    ],
    "DLC Icons": ["Afterbirth", "Afterbirth+", "Repentance"],
    "Misc Game Icons": ["Bomb", "Key", "Coin", "Pill", "Card", "Trinket"]
}

icon_links = {}

print("Please provide the link for each icon. Press Enter to skip if you couldn't find it.")

for category, icon_list in icons.items():
    print(f"\n{category}:")
    for icon in icon_list:
        link = input(f"{icon}: ").strip()
        if link:
            trimmed_link = trim_url(link)
            icon_links[icon] = trimmed_link

# Save to JSON file
with open('icon_links.json', 'w') as f:
    json.dump(icon_links, f, indent=2)

print("\nIcon links have been saved to 'icon_links.json'")