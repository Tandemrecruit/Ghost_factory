import unicodedata

emojis = {
    "rocket": "🚀",
    "next": "⏭️", 
    "check": "✅",
    "brick": "🧱",
    "construction": "🏗️",
    "money": "💰",
    "stopwatch": "⏱️"
}

print(f"{'Name':<15} {'Chars':<10} {'Hex':<20} {'EAW Types'}")
print("-" * 60)

for name, char in emojis.items():
    hex_vals = " ".join([f"{ord(c):X}" for c in char])
    eaw_types = " ".join([unicodedata.east_asian_width(c) for c in char])
    print(f"{name:<15} {len(char):<10} {hex_vals:<20} {eaw_types}")

